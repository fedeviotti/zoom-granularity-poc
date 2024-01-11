import './App.css'
import {LineChart} from "./LineChart.tsx";
import {ChakraProvider} from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <LineChart />
    </ChakraProvider>
  )
}

export default App
