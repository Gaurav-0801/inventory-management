import Dashboard from "./dashboard/page";
import Expenses from "./expenses/page";
import Inventory from "./inventory/page";
import Products from "./products/page";


export default function Home() {
  return (
    <>
      <Dashboard />
      <Inventory />
      <Products/>
      <Expenses/>
    </>
  );
}
