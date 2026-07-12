import type { MessMenuEntry } from "@/types";

const days: MessMenuEntry["day_of_week"][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const breakfastCycle = [["Idli", "Sambar", "Chutney"], ["Poha", "Tea"], ["Aloo Paratha", "Curd"], ["Upma", "Coconut Chutney"], ["Bread Omelette / Bread Jam", "Milk"], ["Dosa", "Sambar"], ["Puri", "Bhaji"]];
const lunchCycle = [["Rice", "Dal", "Mixed Veg", "Roti"], ["Rajma", "Rice", "Salad"], ["Chole", "Bhature", "Salad"], ["Sambar Rice", "Papad"], ["Paneer Curry", "Roti", "Rice"], ["Curd Rice", "Pickle"], ["Veg Biryani", "Raita"]];
const snacksCycle = [["Samosa", "Tea"], ["Fruit Bowl"], ["Sandwich", "Juice"], ["Bhel Puri"], ["Biscuits", "Milk"], ["Pakora", "Tea"], ["Cutlet", "Ketchup"]];
const dinnerCycle = [["Roti", "Dal Fry", "Sabzi"], ["Khichdi", "Papad"], ["Pulao", "Raita"], ["Roti", "Paneer", "Salad"], ["Fried Rice", "Manchurian"], ["Roti", "Egg Curry / Soya Curry"], ["Rice", "Sambar", "Poriyal"]];

export const messMenu: MessMenuEntry[] = days.flatMap((day, i) => [
  { id: `mm-${day}-breakfast`, day_of_week: day, meal: "breakfast" as const, items: breakfastCycle[i] },
  { id: `mm-${day}-lunch`, day_of_week: day, meal: "lunch" as const, items: lunchCycle[i] },
  { id: `mm-${day}-snacks`, day_of_week: day, meal: "snacks" as const, items: snacksCycle[i] },
  { id: `mm-${day}-dinner`, day_of_week: day, meal: "dinner" as const, items: dinnerCycle[i] },
]);
