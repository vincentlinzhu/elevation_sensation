import React from 'react'
// import VegaLite from "react-vega-lite";
// import ReactVega from "react-vega";
// import VegaLite from "react-vega-lite";
import pieData from "./pieData";

function PieChart() {
    const pieSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "A simple pie chart with embedded data.",
        "mark": "arc",
        "encoding": {
            "theta": {"field": "value", "type": "quantitative"},
            "color": {"field": "category", "type": "nominal"}
        }
    };
    // const PieChart = VegaLite.createClassFromSpec('PieChart', pieSpec);

    return (
        <div>
            {/* <VegaLite spec={pieSpec} data={{ values: pieData }}/> */}
        </div>
    )
}

export default PieChart;