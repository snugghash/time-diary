import React from 'react';
import ReactDOM from 'react-dom';
import Reporting from './Reporting';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Reporting />, document.getElementById('reports-root'));
registerServiceWorker();