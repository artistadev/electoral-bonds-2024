import React from 'react';
import { Bar } from "react-chartjs-2";

function BarChart({data, options}) {
  return (
    <Bar data={data} options={options} />
  )
}

export default BarChart