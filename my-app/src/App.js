import logo from './logo.svg';
import './App.css';
import ScatterPlot from './visualizations/scatter_plot_2';
import AutomaticInteraction from './interaction/AutomaticInteraction';

function App() {
  return (
    <div style={{borderStyle:'solid', position:'absolute', margin:'10px 0px 0px 10px'}}>
      <AutomaticInteraction>
        <ScatterPlot />
      </AutomaticInteraction>
    </div>
  );
}

export default App;
