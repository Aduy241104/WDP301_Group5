import './index.css' // import Tailwind
import AppRoutes from './router/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import "react-loading-skeleton/dist/skeleton.css";


function App() {

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );

}

export default App
