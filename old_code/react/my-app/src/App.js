import logo from './logo.svg';
import './App.css';
import ScatterPlot from '../../../../examples/visualizations/scatter_plot_2';
import AutomaticInteraction from './interaction/AutomaticInteraction';

function App() {
  return (
    <div style={{position: 'absolute', top: '50%', left: '50%', marginRight: '-50%', transform: 'translate(-50%, -50%)'}}>
      <AutomaticInteraction>
        <ScatterPlot />
      </AutomaticInteraction>
    </div>
  );
}

export default App;
