const Order = require("../models/Order");
const Product = require("../models/Product");
const Inquiry = require("../models/Inquiry");

const getMetrics = async (req, res) => {
  try {
    console.log("📊 ➡️ Calculando métricas del dashboard...");
    console.log("   🔍 Filtros recibidos:", req.query);

    const { startDate, endDate, period } = req.query;
    
    let dateFilter = {};
    let chartData = [];
    let now = new Date();
    let startOfPeriod;
    
    if (period === 'day') {
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const hoursData = await Order.aggregate([
        { 
          $match: { 
            paymentStatus: "paid",
            createdAt: { $gte: startOfPeriod }
          }
        },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            total: { $sum: "$totalUSD" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      for (let i = 0; i < 24; i++) {
        const hourData = hoursData.find(h => h._id === i);
        chartData.push({
          label: `${i}:00`,
          value: hourData ? hourData.total : 0,
          count: hourData ? hourData.count : 0
        });
      }
    } else if (period === 'year') {
      startOfPeriod = new Date(now.getFullYear(), 0, 1);
      const monthsData = await Order.aggregate([
        { 
          $match: { 
            paymentStatus: "paid",
            createdAt: { $gte: startOfPeriod }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$totalUSD" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 1; i <= 12; i++) {
        const monthData = monthsData.find(m => m._id === i);
        chartData.push({
          label: monthNames[i - 1],
          value: monthData ? monthData.total : 0,
          count: monthData ? monthData.count : 0
        });
      }
    } else {
      startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysData = await Order.aggregate([
        { 
          $match: { 
            paymentStatus: "paid",
            createdAt: { $gte: startOfPeriod }
          }
        },
        {
          $group: {
            _id: { $dayOfMonth: "$createdAt" },
            total: { $sum: "$totalUSD" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dayData = daysData.find(d => d._id === i);
        chartData.push({
          label: i.toString(),
          value: dayData ? dayData.total : 0,
          count: dayData ? dayData.count : 0
        });
      }
    }
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
        console.log("   📅 Fecha inicio:", startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
        console.log("   📅 Fecha fin:", endDate);
      }
    }

    const baseMatch = Object.keys(dateFilter).length > 0 ? { ...dateFilter } : {};

    console.log("   📊 Contando pedidos totales...");
    const totalOrdersResult = await Order.countDocuments(baseMatch);
    console.log("      → Total pedidos:", totalOrdersResult);
    
    const paidOrdersResult = await Order.countDocuments({
      ...baseMatch,
      paymentStatus: "paid"
    });
    console.log("      → Pedidos pagados:", paidOrdersResult);
    
    const pendingOrdersResult = await Order.countDocuments({
      ...baseMatch,
      paymentStatus: "pending"
    });
    console.log("      → Pedidos pendientes:", pendingOrdersResult);
    
    const cancelledOrdersResult = await Order.countDocuments({
      ...baseMatch,
      paymentStatus: "failed"
    });
    console.log("      → Pedidos fallidos:", cancelledOrdersResult);

    console.log("   💰 Calculando ingresos totales...");
    const revenueAggregation = await Order.aggregate([
      { $match: { ...baseMatch, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalUSD" } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.total || 0;
    console.log("      → Ingresos totales: $", totalRevenue.toLocaleString());

    console.log("   📅 Calculando ingresos de hoy...");
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayRevenueAgg = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          createdAt: { $gte: startOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalUSD" }, count: { $sum: 1 } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    const todayOrders = todayRevenueAgg[0]?.count || 0;
    console.log("      → Ingresos de hoy: $", todayRevenue.toLocaleString());

    console.log("   📅 Calculando ingresos del mes actual...");
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthlyRevenueAggregation = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalUSD" }, count: { $sum: 1 } } }
    ]);
    const monthlyRevenue = monthlyRevenueAggregation[0]?.total || 0;
    const monthlyOrders = monthlyRevenueAggregation[0]?.count || 0;
    console.log("      → Ingresos mensuales: $", monthlyRevenue.toLocaleString());

    console.log("   📅 Calculando ingresos del año actual...");
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const yearlyRevenueAgg = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          createdAt: { $gte: startOfYear }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalUSD" }, count: { $sum: 1 } } }
    ]);
    const yearlyRevenue = yearlyRevenueAgg[0]?.total || 0;
    const yearlyOrders = yearlyRevenueAgg[0]?.count || 0;
    console.log("      → Ingresos anuales: $", yearlyRevenue.toLocaleString());

    const averageOrderValue = paidOrdersResult > 0 ? totalRevenue / paidOrdersResult : 0;
    console.log("   📈 Valor promedio por orden: $", averageOrderValue.toLocaleString());

    console.log("   📦 Contando productos activos...");
    const products = await Product.countDocuments({ active: true });
    console.log("      → Productos activos:", products);

    console.log("   📬 Contando consultas pendientes...");
    const pendingInquiries = await Inquiry.countDocuments({ status: "pending" });
    console.log("      → Consultas pendientes:", pendingInquiries);

    console.log("✅ Métricas calculadas exitosamente");
    
    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
    const totalChartValue = chartData.reduce((sum, d) => sum + d.value, 0);
    const totalChartCount = chartData.reduce((sum, d) => sum + d.count, 0);
    const avgValue = totalChartCount > 0 ? totalChartValue / totalChartCount : 0;
    
    res.json({
      totalRevenue,
      totalOrders: totalOrdersResult,
      paidOrders: paidOrdersResult,
      pendingOrders: pendingOrdersResult,
      cancelledOrders: cancelledOrdersResult,
      monthlyRevenue,
      monthlyOrders,
      todayRevenue,
      todayOrders,
      yearlyRevenue,
      yearlyOrders,
      averageOrderValue,
      totalProducts: products,
      pendingInquiries,
      chartData,
      chartStats: {
        maxValue,
        avgValue,
        totalCount: totalChartCount
      }
    });
  } catch (error) {
    console.error("🔥 Error en métricas:", error.message);
    res.status(500).json({ message: "Error obteniendo métricas" });
  }
};

module.exports = { getMetrics };
