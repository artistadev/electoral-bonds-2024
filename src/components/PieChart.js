import React from 'react'
import { Pie } from 'react-chartjs-2';

function PieChart({data, options}) {
      return <Pie data={data} options={options}/>;
}

export default PieChart