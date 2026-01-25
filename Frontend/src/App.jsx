import './index.css' // import Tailwind
import AppRoutes from './router/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';

function App() {

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );

}

export default App
