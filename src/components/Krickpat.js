import React, { useState, useEffect, useRef } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import * as d3 from "d3";

export default function Krickpat() {
  const [numPoints, setNumPoints] = useState(10);
  const [points, setPoints] = useState([]);
  const [edges, setEdges] = useState([]);
  const [step, setStep] = useState(0);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isForward, setIsForward] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [log, setLog] = useState([]);
  const [pointGeneratedRamdomly, setPointGeneratedRamdomly] = useState(true);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false); // New state to track whether canvas is open
  const [isSpinning, setIsSpinning] = useState(false);
  const [isUpload, setIsUpload] = useState(false);

  const svgRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    generateRandomPoints(numPoints);
    return () => clearInterval(timerRef.current);
  }, []);

  function compareX(a, b) {
    return a[0] - b[0];
  }

  function partition(nums, left, right, pivotIndex) {
    let pivotValue = nums[pivotIndex];
    [nums[pivotIndex], nums[right]] = [nums[right], nums[pivotIndex]]; // Move pivot to end
    let storeIndex = left;
    for (let i = left; i < right; i++) {
      if (nums[i] < pivotValue) {
        [nums[i], nums[storeIndex]] = [nums[storeIndex], nums[i]];
        storeIndex++;
      }
    }
    [nums[storeIndex], nums[right]] = [nums[right], nums[storeIndex]]; // Move pivot to its final place
    return storeIndex;
  }

  function quickselect(nums, left, right, k) {
    if (left >= right) {
      return nums[left];
    }

    let pivotIndex = left + ((right - left) >> 1);
    pivotIndex = partition(nums, left, right, pivotIndex);

    if (k === pivotIndex) {
      return nums[k];
    } else if (k < pivotIndex) {
      return quickselect(nums, left, pivotIndex - 1, k);
    } else {
      return quickselect(nums, pivotIndex + 1, right, k);
    }
  }

  function findMedian(nums) {
    if (nums.length === 0) {
      throw new Error("Cannot find median of an empty array.");
    }

    let n = nums.length;
    let mid = n / 2;
    let median = quickselect(nums, 0, n - 1, mid);

    // If the size is even, we need to find the average of the two middle numbers
    if (n % 2 === 0) {
      let lowerMedian = quickselect(nums, 0, mid - 1, mid - 1);
      median = (median + lowerMedian) / 2.0;
    }

    return median;
  }

  function findMinMaxX(points) {
    let res = [];
    let minIndex = 0,
      maxIndex = 0;
    let puminx = points[0][0];
    let puminy = points[0][1];
    let pumaxx = points[0][0];
    let pumaxy = points[0][1];

    for (let i = 1; i < points.length; i++) {
      if (
        points[i][0] < puminx ||
        (points[i][0] === puminx && points[i][1] > puminy)
      ) {
        puminx = points[i][0];
        puminy = points[i][1];
        minIndex = i;
      }
      if (
        points[i][0] > pumaxx ||
        (points[i][0] === pumaxx && points[i][1] > pumaxy)
      ) {
        pumaxx = points[i][0];
        pumaxy = points[i][1];
        maxIndex = i;
      }
    }
    res.push([puminx, puminy]);
    res.push([pumaxx, pumaxy]);
    let indices = [minIndex, maxIndex];
    return [res, indices];
  }

  function UpperBridge(points, a) {
    let candidates = [];
    let n = points.length;
    if (points.length === 2) {
      if (points[0][0] < points[1][0]) return [points[0], points[1]];
      else return [points[1], points[0]];
    }
    let pairs = [];
    let K = [];
    let i = 0;
    if (points.length % 2 === 1) {
      candidates.push(points[0]);
      i++;
    }
    for (; i <= n - 2; i += 2) {
      let x1 = points[i][0];
      let x2 = points[i + 1][0];

      if (x1 <= x2) {
        pairs.push([points[i], points[i + 1]]);
      } else {
        pairs.push([points[i + 1], points[i]]);
      }
    }

    for (i = 0; i < pairs.length; i++) {
      let p1 = pairs[i][0];
      let p2 = pairs[i][1];

      if (p1[0] === p2[0]) {
        if (p1[1] > p2[1]) {
          candidates.push(p1);
        } else {
          candidates.push(p2);
        }
      } else {
        K.push((p1[1] - p2[1]) / (p1[0] - p2[0]));
      }
    }

    let medianK = findMedian(K);

    let smaller = [],
      equal = [],
      larger = [];

    for (i = 0; i < pairs.length; i++) {
      let p1 = pairs[i][0];
      let p2 = pairs[i][1];

      let slopeVal = (p1[1] - p2[1]) / (p1[0] - p2[0]);
      if (slopeVal < medianK) {
        smaller.push([p1, p2]);
      } else if (slopeVal === medianK) {
        equal.push([p1, p2]);
      } else {
        larger.push([p1, p2]);
      }
    }

    let maximumIntercept = -Infinity;

    for (let point of points) {
      let y = point[1];
      let x = point[0];

      if (maximumIntercept < y - medianK * x) {
        maximumIntercept = y - medianK * x;
      }
    }

    let pk = [Infinity, Infinity];
    let pm = [-Infinity, -Infinity];

    for (let point of points) {
      let y = point[1];
      let x = point[0];

      if (y - medianK * x === maximumIntercept) {
        if (x < pk[0]) {
          pk = [x, y];
        }
        if (x > pm[0]) {
          pm = [x, y];
        }
      }
    }

    if (pk[0] <= a && pm[0] > a) {
      return [pk, pm];
    }

    if (pm[0] <= a) {
      for (let pair of larger) {
        candidates.push(pair[1]);
      }
      for (let pair of equal) {
        candidates.push(pair[1]);
      }
      for (let pair of smaller) {
        candidates.push(pair[1]);
        candidates.push(pair[0]);
      }
    }

    if (pk[0] > a) {
      for (let pair of larger) {
        candidates.push(pair[1]);
        candidates.push(pair[0]);
      }
      for (let pair of equal) {
        candidates.push(pair[0]);
      }
      for (let pair of smaller) {
        candidates.push(pair[0]);
      }
    }

    return UpperBridge(candidates, a);
  }

  function partition_pair(S, left, right) {
    let pivotValue = S[right];
    let storeIndex = left;

    for (let i = left; i < right; i++) {
      if (S[i][0] < pivotValue[0]) {
        [S[i], S[storeIndex]] = [S[storeIndex], S[i]];
        storeIndex++;
      }
    }

    [S[storeIndex], S[right]] = [S[right], S[storeIndex]];
    return storeIndex;
  }

  function quickSelect_pair(S, left, right, k) {
    if (left === right) return S[left];

    let pivotIndex = partition_pair(S, left, right);

    if (k === pivotIndex) return S[k];
    else if (k < pivotIndex)
      return quickSelect_pair(S, left, pivotIndex - 1, k);
    else return quickSelect_pair(S, pivotIndex + 1, right, k);
  }

  function connect_U(pk, pm, S, edges) {
    let medianX;
    let n = S.length;

    let medianPoint = quickSelect_pair(S, 0, n - 1, Math.floor(n / 2)); // Find the median point

    medianX = medianPoint[0];

    console.log("Median line: x = " + medianX);

    let ub = UpperBridge(S, medianX);

    let pi = ub[0];
    let pj = ub[1];

    edges.push(ub);

    let S_left = [],
      S_right = [];

    S_left.push(pi);
    S_right.push(pj);

    for (let point of S) {
      if (point[0] < pi[0]) {
        S_left.push(point);
      }
      if (point[0] > pj[0]) {
        S_right.push(point);
      }
    }

    if (pi[0] !== pk[0] || pi[1] !== pk[1]) {
      connect_U(pk, pi, S_left, edges);
    }
    if (pj[0] !== pm[0] || pj[1] !== pm[1]) {
      connect_U(pj, pm, S_right, edges);
    }
  }

  function UpperHull(points, edges) {
    let n = points.length;
    if (n === 2) {
      edges.push([points[0], points[1]]);
      return;
    }

    let temp = findMinMaxX(points);

    let pmin = temp[0][0];
    let pmax = temp[0][1];

    let minIndex = temp[1][0];
    let maxIndex = temp[1][1];

    if (minIndex === maxIndex) {
      return;
    }

    let uhPoints = [];

    uhPoints.push(pmin);
    uhPoints.push(pmax);
    for (let point of points) {
      if (point[0] > pmin[0] && point[0] < pmax[0]) {
        uhPoints.push(point);
      }
    }

    let medianPoint = quickSelect_pair(
      uhPoints,
      0,
      uhPoints.length - 1,
      Math.floor(uhPoints.length / 2)
    );
    let medianX = medianPoint[0];

    let uhPointsSorted = [...uhPoints];

    connect_U(pmin, pmax, uhPointsSorted, edges);
  }

  function connect_L(pk, pm, S, edges) {
    let medianX;
    let n = S.length;

    let medianPoint = quickSelect_pair(S, 0, n - 1, Math.floor(n / 2)); // Find the median point

    medianX = medianPoint[0];

    console.log("Median line: x = " + medianX);

    let ub = UpperBridge(S, medianX);

    let pi = ub[0];
    let pj = ub[1];

    edges.push([
      [-ub[0][0], -ub[0][1]],
      [-ub[1][0], -ub[1][1]],
    ]);

    let S_left = [],
      S_right = [];

    S_left.push(pi);
    S_right.push(pj);

    for (let point of S) {
      if (point[0] < pi[0]) {
        S_left.push(point);
      }
      if (point[0] > pj[0]) {
        S_right.push(point);
      }
    }

    if (pi[0] !== pk[0] || pi[1] !== pk[1]) {
      connect_L(pk, pi, S_left, edges);
    }
    if (pj[0] !== pm[0] || pj[1] !== pm[1]) {
      connect_L(pj, pm, S_right, edges);
    }
  }

  function LowerHull(points, edges) {
    let n = points.length;
    if (n === 2) {
      edges.push([points[0], points[1]]);
      return;
    }

    points.sort(compareX);

    let temp = findMinMaxX(points);

    let pmin = temp[0][0];
    let pmax = temp[0][1];

    let minIndex = temp[1][0];
    let maxIndex = temp[1][1];

    if (minIndex === maxIndex) {
      return;
    }

    let uhPoints = [];

    uhPoints.push(pmin);
    uhPoints.push(pmax);
    for (let point of points) {
      if (point[0] > pmin[0] && point[0] < pmax[0]) {
        uhPoints.push(point);
      }
    }

    let medianPoint = quickSelect_pair(
      uhPoints,
      0,
      uhPoints.length - 1,
      Math.floor(uhPoints.length / 2)
    );
    let medianX = medianPoint[0];

    let uhPointsSorted = [...uhPoints];

    connect_L(pmin, pmax, uhPointsSorted, edges);
  }

  // -------------------------------------------------------------------------------------------------------------------

  const handleRefreshClick = () => {
    setIsSpinning(true);

    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);

    const svg = d3.select(svgRef.current);
    svg.selectAll("polygon").remove()
    svg.selectAll("path").remove()
    svg.selectAll("circle").remove()// Clear existing elements
    svg.selectAll("line:not(.axis-line)").remove();
    setPoints([]);
  };

  function handleCanvasClick() {
    const svg = d3.select(svgRef.current);
    svg.selectAll("polygon").remove();
    svg.selectAll("path").remove();
    svg.selectAll("circle").remove();
    svg.selectAll("line:not(.axis-line)").remove();
    
    setPoints([]); // Clear the points state
    setPointGeneratedRamdomly(false);
    setIsCanvasOpen(true);
    setIsUpload(true);
  }

  const handleClick = (event) => {
    const svg = d3.select(svgRef.current);
    const [x, y] = d3.pointer(event); // Get mouse coordinates relative to SVG element
    const newPoint = [x, y];

    console.log("Previous points:", points);
    setPoints((prevPoints) => [...prevPoints, newPoint]);
    console.log("Updated points:", [...points, newPoint]);

    // Draw all points with animation
    // drawPoints([...points, newPoint]);

    // Draw the new point on the SVG
    svg
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 4.5) // Adjust radius as needed
      .attr("fill", "#16FF00"); // Adjust color as needed

    d3.selectAll("circle").interrupt();
  };

  function generateRandomPoints(numPoints) {
    const svgWidth = 750; // Updated SVG width
    const svgHeight = 550; // Updated SVG height
    const newPoints = Array.from({ length: numPoints }, () => [
      Math.random() * svgWidth,
      Math.random() * svgHeight,
    ]);
    setPoints(newPoints);
    setEdges([]);
    setStep(0);
    setLog([]);
    drawPoints(newPoints);
  }

  function drawPoints(data, checkedPoint, chosenPoint) {
    const svg = d3.select(svgRef.current);
    svg.selectAll("polygon").remove()
    svg.selectAll("line:not(.axis-line)").remove();
    svg.selectAll("circle").remove()
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("r", 4.5) // Decrease the radius of the circles
      .attr("fill", "#16FF00") // Set neon green color for the fill  #16FF00
      .attr("stroke-width", 0.5) // Set the stroke width of the circles
      .each(function () {
        const circle = d3.select(this);
        animateCircle(circle, true); // Start animation and loop
      });
  }

  function animateCircle(circle) {
    const duration = 1000; // Duration of the animation (in milliseconds)

    circle
      .transition()
      .duration(duration)
      .ease(d3.easeCubicInOut) // Use cubic-in-out easing function for smoother motion
      .attr("cx", function (d) {
        return d[0] + Math.random() * 10 - 7;
      }) // Randomize x position within a small range
      .attr("cy", function (d) {
        return d[1] + Math.random() * 10 - 7;
      }) // Randomize y position within a small range
      .on("end", function () {
        animateCircle(circle);
      }); // Repeat the animation
  }

  function startVisualization() {
    setIsCanvasOpen(false);
    setIsUpload(false);
    setStep(0);
    setLog([]);

    setIsVisualizing(true);
    setIsForward(true);
    setIsNext(true);

    let pupper = findMinMaxX(points);

    let edges = [];
    UpperHull(points, edges);
    console.log("Upper Hull edges");
    for (let edge of edges) {
      console.log(
        "(" +
          edge[0][0] +
          "," +
          edge[0][1] +
          "),(" +
          edge[1][0] +
          "," +
          edge[1][1] +
          ")"
      );
    }
    console.log("------");

    let invertedPoints = points.map((point) => [-point[0], -point[1]]);

    console.log("-oo--");
    console.log(invertedPoints);

    let plower = findMinMaxX(invertedPoints);

    LowerHull(invertedPoints, edges);

    for (let edge of edges) {
      console.log(
        "(" +
          edge[0][0] +
          "," +
          edge[0][1] +
          "),(" +
          edge[1][0] +
          "," +
          edge[1][1] +
          ")"
      );
    }

    setEdges(edges);
    console.log("--00--");
    console.log(edges);
    let pmin = pupper[0][0];
    let pmax = pupper[0][1];
    let pmin1 = plower[0][0];
    let pmax1 = plower[0][1];
    let pmin2 = [-pmax1[0], -pmax1[1]];
    let pmax2 = [-pmin1[0], -pmin1[1]];
    pmin1 = pmin2;
    pmax1 = pmax2;
    console.log("Pmin: (" + pmin[0] + "," + pmin[1] + ")");
    console.log("Pmax: (" + pmax[0] + "," + pmax[1] + ")");
    console.log("Pmin1: (" + pmin1[0] + "," + pmin1[1] + ")");
    console.log("Pmax1: (" + pmax1[0] + "," + pmax1[1] + ")");
    if (pmin[0] !== pmin1[0] || pmin[1] !== pmin1[1]) {
      console.log("Hello");
      edges.push([pmin, pmin1]);
    }
    if (pmax[0] !== pmax1[0] || pmax[1] !== pmax1[1]) {
      console.log("Hello");
      edges.push([pmax, pmax1]);
    }
    console.log("\n");
    for (let edge of edges) {
      console.log(
        "(" +
          edge[0][0] +
          "," +
          edge[0][1] +
          "),(" +
          edge[1][0] +
          "," +
          edge[1][1] +
          ")"
      );
    }

    console.log(points);
    setStep(0);
    setLog(["Starting visualization"]);

    // Stop the animation by clearing the transition
    d3.selectAll("circle").interrupt();

    // Reset the circles to their original positions
    if (pointGeneratedRamdomly === true) {
      // Reset the circles to their original positions
      d3.selectAll("circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1]);
    }
  }

  function drawHull(data) {
    const svg = d3.select(svgRef.current);
    svg.selectAll("polygon").remove();

    // Helper function to draw lines with transitions
    function drawLineWithTransition(edge, index) {
      const line = svg
        .append("line")
        .attr("x1", edge[0][0])
        .attr("y1", edge[0][1])
        .attr("x2", edge[0][0]) // Start each line from the same point
        .attr("y2", edge[0][1])
        .attr("stroke", "#45FFCA")
        .attr("stroke-width", 3);

      // Transition line to the end point
      line
        .transition()
        .duration(500) // Duration of transition in milliseconds
        // .delay(index * 500) // Delay each line's transition
        .attr("x2", edge[1][0]) // Transition to the end x-coordinate
        .attr("y2", edge[1][1]); // Transition to the end y-coordinate
    }

    // Draw all edges with transitions
    data.forEach(drawLineWithTransition);
  }

  function nextStep() {
    setIsReset(true);
    setIsForward(false);
    setStep((prevStep) => {
      const newStep = prevStep + 1;
      if (newStep < edges.length) {
        drawHull(edges.slice(0, newStep));
        // Log the step
        setLog([
          ...log,
          `Step ${newStep}: Draw edge from (${edges[newStep][0][0]}, ${edges[newStep][0][1]}) to (${edges[newStep][1][0]}, ${edges[newStep][1][1]})`,
        ]);
      }

      // Check if all steps are completed
      if (newStep === edges.length) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("polygon").remove();
        svg.selectAll("line:not(.axis-line)").remove(); // Clear existing lines (edges)

        // Helper function to draw lines with transitions
        function drawLineWithTransition(edge, index) {
          const line = svg
            .append("line")
            .attr("x1", edge[0][0])
            .attr("y1", edge[0][1])
            .attr("x2", edge[0][0]) // Start each line from the same point
            .attr("y2", edge[0][1])
            .attr("stroke", "#45FFCA")
            .attr("stroke-width", 3);

          // Transition line to the end point
          line
            .transition()
            .duration(500) // Duration of transition in milliseconds
            .attr("x2", edge[1][0]) // Transition to the end x-coordinate
            .attr("y2", edge[1][1]); // Transition to the end y-coordinate
        }

        // Draw all edges with transitions
        edges.forEach(drawLineWithTransition);
        setIsVisualizing(false);
        setIsForward(false);
        setLog([...log, "All edges drawn"]);

        const sortedEdges = sortEdges(edges);

        const hullPolygon = svg
          .append("polygon")
          .attr("points", sortedEdges.map((d) => d.join(",")).join(" "))
          .transition()
          .duration(500) // Convert points to a string format
          .attr("fill", "rgba(255, 255, 255, 0.2)"); // Set white color with 50% transparency
      }

      return newStep;
    });
  }

  function sortEdges(edges) {
    const sortedEdges = [];
    sortedEdges.push(edges[0]); // Add the first edge as it is

    // Find the next edge whose starting point matches the ending point of the previous edge
    for (let i = 1; i < edges.length; i++) {
      const lastPoint = sortedEdges[sortedEdges.length - 1][1];
      const nextEdgeIndex = edges.findIndex(
        (edge) => edge[0][0] === lastPoint[0] && edge[0][1] === lastPoint[1]
      );
      if (nextEdgeIndex !== -1) {
        sortedEdges.push(edges[nextEdgeIndex]);
      } else {
        // If no matching edge is found, break the loop
        break;
      }
    }

    return sortedEdges;
  }

  function fastForward() {
    const svg = d3.select(svgRef.current);
    svg.selectAll("path").remove(); // Clear existing paths
    svg.selectAll("polygon").remove(); // Clear existing paths
    svg.selectAll("line:not(.axis-line)").remove(); // Clear existing lines (edges)

    setIsVisualizing(true);
    setIsNext(false);
    setIsForward(false);

    console.log(isVisualizing);
    console.log(isReset);
    let currStep = 0;
    const playNextStep = () => {
      setIsReset(false);
      if (currStep < edges.length) {
        console.log(currStep);
        currStep++;
        nextStep(); // Call nextStep with incremented step

        setTimeout(playNextStep, 1000); // Call playNextStep again after 0.5 seconds
      } else {
        setIsReset(true);
        setIsVisualizing(false);
        setIsNext(true);
        setIsForward(true);
        clearInterval(timerRef.current);
        setStep(0);
        setLog([]);
      }
    };
    playNextStep(); // Start the recursive function
  }

  function resetGraph() {
    setIsVisualizing(true);
    setIsNext(true);

    setIsForward(true);
    clearInterval(timerRef.current);
    setStep(0);
    setLog([]);
    const svg = d3.select(svgRef.current);
    svg.selectAll("path").remove(); // Clear existing paths
    svg.selectAll("polygon").remove(); // Clear existing paths
    svg.selectAll("line:not(.axis-line)").remove(); // Clear existing lines (edges)
  }

  function triggerFileInput() {
    const fileInput = document.getElementById('uploadFileInput');
    fileInput.click();
  }
  
  function handleFileUpload(event) {
    const file = event.target.files[0];
    const fileName = file.name;
    const fileType = file.type;
  
    if (fileType !== 'text/plain') {
      alert('Please upload a .txt file.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function(e) {
      const fileContent = e.target.result;
      const extractedPoints = extractPointsFromFileContent(fileContent);
      setPoints(extractedPoints);
      // console.log(extractedPoints);
      const svg = d3.select(svgRef.current);
      svg.selectAll("polygon").remove()
      svg.selectAll("line:not(.axis-line)").remove();
      svg.selectAll("circle").remove()
      setPointGeneratedRamdomly(false);
      // drawPoints(extractedPoints);

      svg
        .selectAll("circle")
        .data(extractedPoints)
        .enter()
        .append("circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1])
        .attr("r", 4.5) // Decrease the radius of the circles
        .attr("fill", "#16FF00") // Set neon green color for the fill  #16FF00
        .attr("stroke-width", 0.5) // Set the stroke width of the circles
      };
    reader.readAsText(file);
  }
  
  function extractPointsFromFileContent(fileContent) {
    const regex = /\((-?\d+),(-?\d+)\)/g;
    const points = [];
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      const x = parseInt(match[1]);
      const y = parseInt(match[2]);
      points.push([x + 400,300 - y]);
      console.log("--pp",isVisualizing,isCanvasOpen);
      setIsCanvasOpen(true);
      // + (svgCoordinates.left + svgCoordinates.right)/2, (svgCoordinates.top + svgCoordinates.bottom)/2 - 
    }
    return points;
  }

  return (
    <Container>
      <h1 className="mt-4 mb-4">
        Convex Hull Visualization - Kirkpatrick Seidel
      </h1>
      <Row>
        <Col>
          {isCanvasOpen ? (
            <svg
              ref={svgRef}
              width="800"
              height="600"
              onClick={handleClick} // Attach click event listener
              style={{
                border: "1px solid rgba(169, 169, 169, 0.5)",
                borderRadius: "25px",
                width: "800px",
                height: "600px",
              }} // Add border and rounded corners
            >
              {/* X-axis */}
              <line className = "axis-line" x1="0" y1="300" x2="800" y2="300" stroke="rgba(192, 192, 192, 0.2)" />
              {/* Y-axis */}
              <line className = "axis-line" x1="400" y1="0" x2="400" y2="600" stroke="rgba(192, 192, 192, 0.2)" />
            </svg>
          ) : (
            <svg ref={svgRef} width="800" height="600">
              {/* X-axis */}
              <line className = "axis-line" x1="0" y1="300" x2="800" y2="300" stroke="rgba(192, 192, 192, 0.2)" />
              {/* Y-axis */}
              <line className = "axis-line" x1="400" y1="0" x2="400" y2="600" stroke="rgba(192, 192, 192, 0.2)" />
            </svg>
          )}
        </Col>
        <Col className="log-pane">
          <Row className="mb-4">
            <Col>
              <Form.Group>
                <Form.Label>Number of Points:</Form.Label>
                <input
                  type="range"
                  className="form-range"
                  id="customRange1"
                  min="1"
                  max="100"
                  value={numPoints}
                  disabled={isVisualizing || isCanvasOpen}
                  onChange={(e) => {
                    setNumPoints(parseInt(e.target.value, 10)); // Update the state with the new value
                    generateRandomPoints(parseInt(e.target.value, 10)); // Call the generateRandomPoints function with the new value
                  }}
                />
                <Form.Text style={{ color: "white" }}>
                  {numPoints} points
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <div style={{ paddingLeft: "15px", paddingBottom: "5px" }}>
                <i
                  className={`fa fa-refresh${isSpinning ? " fa-spin" : ""}`}
                  onClick={isCanvasOpen ? handleRefreshClick : null}
                  style={{
                    fontSize: "24px",
                    color: "gray",
                    color: isCanvasOpen ? "white" : "gray",
                    cursor: isCanvasOpen ? "pointer" : "not-allowed",
                  }}
                ></i>
              </div>
              <Button
                className="btn btn-5"
                onClick={handleCanvasClick}
                disabled={isVisualizing || isCanvasOpen}
              >
                Open Canvas
              </Button>{" "}
              <Button
                className="btn btn-5"
                onClick={startVisualization}
                disabled={isVisualizing}
              >
                Start Visualization
              </Button>{" "}
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <Button
                className="btn btn-5"
                onClick={nextStep}
                disabled={!isVisualizing || step === edges.length || !isNext}
              >
                Next Step
              </Button>{" "}
              <Button
                className="btn btn-5"
                onClick={fastForward}
                disabled={!isVisualizing || !isForward}
              >
                Fast Forward
              </Button>{" "}
              <Button
                className="btn btn-5"
                onClick={resetGraph}
                disabled={!isReset}
              >
                Reset Graph
              </Button>
            </Col>
          </Row>
          <Row style={{paddingLeft : '15px'}}>
            <input  type="file" accept=".txt" id="uploadFileInput" style={{ display: 'none' }} onChange={handleFileUpload} />
            <Button className="btn btn-5" disabled={isVisualizing || isUpload} onClick={triggerFileInput}>Upload .txt File</Button>
          </Row>
          {log.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </Col>
      </Row>
    </Container>
  );
}
