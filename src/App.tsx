import AppContextProvider from './AppContextProvider';
import Page from './Page';

function App() {
  return <AppContextProvider>
    <Page></Page>
  </AppContextProvider>;
}

export default App;