import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import Footer from "../Common/Footer"
import Header from "../Common/Header"

const UserLayout = () => {
  useEffect(() => {
    // Check if user just logged in with a pending guest cart item
    const shouldOpenCart = sessionStorage.getItem("openCartAfterLogin");
    if (shouldOpenCart === "true") {
      sessionStorage.removeItem("openCartAfterLogin");
      
      // Give the DOM a brief moment to mount, then trigger the cart drawer open event
      setTimeout(() => {
        window.dispatchEvent(new Event("openCartDrawer"));
      }, 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors flex flex-col justify-between">
        <div>
            {/* Header / Navbar */}
            <Header />
            {/* Main Content */}
            <main>
              <Outlet />
            </main>
        </div>
        {/* Footer */}
        <Footer />
    </div>
  )
}

export default UserLayout;