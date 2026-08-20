import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Footer from "../Common/Footer"
import Header from "../Common/Header"

const UserLayout = () => {
  useEffect(() => {
    const shouldOpenCart = sessionStorage.getItem("openCartAfterLogin");
    if (shouldOpenCart === "true") {
      sessionStorage.removeItem("openCartAfterLogin");
      
      setTimeout(() => {
        window.dispatchEvent(new Event("openCartDrawer"));
      }, 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors flex flex-col justify-between selection:bg-stone-900 selection:text-white dark:selection:bg-stone-100 dark:selection:text-stone-900">
        <div>
            <Header />
            <main>
              <Outlet />
            </main>
        </div>
        <Footer />
    </div>
  )
}

export default UserLayout;