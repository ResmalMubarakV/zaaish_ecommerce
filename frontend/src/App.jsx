import { BrowserRouter , Route , Routes} from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import Home from "./Pages/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        </Route>
        <Route>{/* Admin Layout */}</Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;