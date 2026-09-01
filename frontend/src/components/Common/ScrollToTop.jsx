import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Instant scroll to top on route change to prevent pages from loading at previous scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;