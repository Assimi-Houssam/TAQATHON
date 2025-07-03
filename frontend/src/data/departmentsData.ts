import { startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export interface DepartmentData {
  id: string;
  name: string;
  data: Record<string, number>;
}

export const departments = [
  { id: "it", name: "IT" },
  { id: "ops", name: "Operations" },
  { id: "marketing", name: "Marketing" },
  { id: "hr", name: "HR" },
  { id: "finance", name: "Finance" },
  { id: "sales", name: "Sales" },
  { id: "rd", name: "R&D" },
  { id: "legal", name: "Legal" },
  { id: "support", name: "Support" },
  { id: "product", name: "Product" },
] as const;

// Generate data for each department from 2022 to 2025
const generateDepartmentsData = () => {
  const startDate = new Date(2022, 0, 1);
  const endDate = new Date(2025, 11, 31);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return departments.map((dept) => {
    const monthlyData: Record<string, number> = {};
    
    months.forEach((month) => {
      const key = month.toISOString().slice(0, 7); // Format: YYYY-MM
      
      // Generate realistic-looking data with seasonal patterns
      const baseValue = 200 + Math.random() * 300;
      const seasonalFactor = Math.sin((month.getMonth() / 11) * Math.PI) * 100;
      const trendFactor = (month.getFullYear() - 2022) * 50; // Increasing trend over years
      const randomNoise = Math.random() * 50 - 25;
      
      monthlyData[key] = Math.round(Math.max(100, baseValue + seasonalFactor + trendFactor + randomNoise));
    });

    return {
      id: dept.id,
      name: dept.name,
      data: monthlyData,
    };
  });
};

export const departmentsData = generateDepartmentsData();

// Utility functions
export const getMonthlyData = (dateRange: { from: Date; to: Date } | undefined) => {
  if (!dateRange?.from || !dateRange?.to) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return departments.map((dept) => ({
      name: dept.name,
      value: departmentsData.find(d => d.id === dept.id)?.data[currentMonth] || 0,
    }));
  }

  const start = startOfMonth(dateRange.from);
  const end = endOfMonth(dateRange.to);
  const months = eachMonthOfInterval({ start, end });

  return departments.map((dept) => {
    const departmentData = departmentsData.find(d => d.id === dept.id);
    const values = months.map(month => {
      const key = month.toISOString().slice(0, 7);
      return departmentData?.data[key] || 0;
    });
    
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return {
      name: dept.name,
      value: Math.round(average),
    };
  });
}; 