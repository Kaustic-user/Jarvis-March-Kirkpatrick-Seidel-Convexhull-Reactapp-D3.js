import React, { useState, useEffect, useRef } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import * as d3 from "d3";
// import Axes from './Axes';

function orientation(p1, p2, p3) {
  const [x1, y1, x2, y2, x3, y3] = [...p1, ...p2, ...p3];
  const d = (y3 - y2) * (x2 - x1) - (y2 - y1) * (x3 - x2);
  if (d > 0) {
    return 1;
  } else if (d < 0) {
    return -1;
  } else {
    return 0;
  }
}

function dist(p1, p2) {
  const [x1, y1, x2, y2] = [...p1, ...p2];
  return Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
}

function giftWrapping(points) {
  let onHull = points.reduce(
    (min, p) => (p[1] < min[1] || (p[1] === min[1] && p[0] < min[0]) ? p : min),
    points[0]
  );
  let hull = [];
  let lines = {};
  console.log("This is the first point", points[0]);
  while (true) {
    hull.push(onHull);
    lines[onHull] = [];
    let nextPoint = points[0];

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const o = orientation(onHull, nextPoint, point);
      lines[onHull].push(point);

      if (
        nextPoint === onHull ||
        o === 1 ||
        (o === 0 && dist(onHull, point) > dist(onHull, nextPoint))
      ) {
        nextPoint = point;
      }
    }
    onHull = nextPoint;
    if (onHull === hull[0]) {
      break;
    }
  }
  return { convexHull: hull, mylines: lines };
}

export default function JarvisMarch() {
  const [numPoints, setNumPoints] = useState(10);
  const [points, setPoints] = useState([]);
  const [hull, setHull] = useState([]);
  const [lines, setLines] = useState({});
  const [step, setStep] = useState(0);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isForward, setIsForward] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [log, setLog] = useState([]);
  const [pointGeneratedRamdomly, setPointGeneratedRamdomly] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  const [isCanvasOpen, setIsCanvasOpen] = useState(false); // New state to track whether canvas is open
  const [isUpload, setIsUpload] = useState(false);


  const svgRef = useRef();
  const timerRef = useRef();

  const [svgCoordinates, setSvgCoordinates] = useState({});

  useEffect(() => {
    // Update SVG coordinates on component mount
    const svg = d3.select(svgRef.current);
    const rect = svg.node().getBoundingClientRect();
    setSvgCoordinates({
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left
    });
    // No need to log svgCoordinates here
    // Cleanup function
    return () => clearInterval(timerRef.current);
  }, []);


  
  useEffect(() => {
    // Log svgCoordinates whenever it changes
    console.log(svgCoordinates);
  }, [svgCoordinates]);
  
  

  useEffect(() => {
    generateRandomPoints(numPoints);
    const svg = d3.select(svgRef.current);

    // X-axis
    // svg.append('line')
    //   .attr('x1', 0)
    //   .attr('y1', 300)
    //   .attr('x2', 800)
    //   .attr('y2', 300)
    //   .attr('stroke', 'white');

    // // Y-axis
    // svg.append('line')
    //   .attr('x1', 400)
    //   .attr('y1', 0)
    //   .attr('x2', 400)
    //   .attr('y2', 600)
    //   .attr('stroke', 'white');
    return () => clearInterval(timerRef.current);
  }, []);

  const handleRefreshClick = () => {
    setIsSpinning(true);

    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);

    const svg = d3.select(svgRef.current);
    // svg.selectAll("*").remove(); // Clear existing elements
    svg.selectAll("polygon").remove()
    svg.selectAll("path").remove()
    svg.selectAll("circle").remove()
    setPoints([]);
  };

  function handleCanvasClick() {
    const svg = d3.select(svgRef.current);
    // svg.selectAll("*").remove
    svg.selectAll("polygon").remove()
    svg.selectAll("path").remove()
    svg.selectAll("circle").remove()
    setPoints([]); // Clear the points state
    setPointGeneratedRamdomly(false);
    setIsCanvasOpen(true);
    setIsUpload(true);
    // setIsReset(true);
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
    const svgWidth = 800; // Updated SVG width
    const svgHeight = 600; // Updated SVG height
    const newPoints = Array.from({ length: numPoints }, () => [
      Math.random() * svgWidth,
      Math.random() * svgHeight,
    ]);
    setPointGeneratedRamdomly(true);
    setPoints(newPoints);
    setHull([]);
    setStep(0);
    setLog([]);
    drawPoints(newPoints);
  }

  function drawPoints(data, checkedPoint, chosenPoint) {
    const svg = d3.select(svgRef.current);
    // svg.selectAll("*").remove(); // Clear existing elements
    svg.selectAll("polygon").remove()
    svg.selectAll("path").remove()
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
    setHull([]);
    setStep(0);
    setLog([]);

    setIsVisualizing(true);
    setIsForward(true);
    setIsNext(true);
    // setIsReset(true);
    console.log(points[0]);
    const { convexHull, mylines } = giftWrapping(points);
    console.log(mylines);
    console.log(convexHull.length);
    console.log("---------------");
    setHull(convexHull);
    setLines(mylines);
    setStep(0);
    setLog(["Starting visualization"]);

    // Stop the animation by clearing the transition
    d3.selectAll("circle").interrupt();

    if (pointGeneratedRamdomly === true) {
      // Reset the circles to their original positions
      d3.selectAll("circle")
        .attr("cx", (d) => d[0])
        .attr("cy", (d) => d[1]);
    }
  }

  function drawConvexHull(data) {
    const svg = d3.select(svgRef.current);
    svg.selectAll("polygon").remove();

    const line = svg
      .append("path")
      .attr("fill", "none") // Set fill to none
      .attr("stroke", "#45FFCA") // Set light blue color for the stroke
      .attr("stroke-width", 3); // Increase the stroke width of the line

    // Calculate the length of the line path
    const path = d3.line()(data);
    const totalLength = svg
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .transition()
      .duration(500)
      .node()
      .getTotalLength();

    line
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .attr("fill", "none") // Set fill to none

      .attr("d", path)
      .transition()
      .duration(500) // Duration of 0.5 seconds
      .attr("stroke-dashoffset", 0); // Transition to fully drawn line

    const hullPolygon = svg
      .append("polygon")
      .attr("points", data.map((d) => d.join(",")).join(" "))
      .transition()
      .duration(500) // Convert points to a string format
      .attr("fill", "rgba(255, 255, 255, 0.2)"); // Set white color with 50% transparency
  }

  function drawLine(currentPoint, connectedPoint) {
    const svg = d3.select(svgRef.current);

    // Draw line between current point and connected point
    const line = svg
      .append("line")
      .attr("x1", currentPoint[0])
      .attr("y1", currentPoint[1])
      .attr("x2", connectedPoint[0])
      .attr("y2", connectedPoint[1])
      .attr("stroke", "red")
      .attr("stroke-width", 3);

    setTimeout(() => {
      line.remove();
    }, 200);
  }

  function nextStep() {
    setIsReset(true);
    setIsForward(false);
    setStep((prevStep) => {
      const newStep = prevStep + 1;
      if (newStep < hull.length) {
        const currentPoint = hull[prevStep];
        const connectedPoints = lines[currentPoint.toString()];
        console.log("currentPoint connectedPoints", currentPoint);
        console.log(connectedPoints);

        const drawLinesWithDelay = (index) => {
          if (index < connectedPoints.length) {
            const connectedPoint = connectedPoints[index];
            drawLine(currentPoint, connectedPoint);

            // Call drawLinesWithDelay recursively with the next index after a delay
            setTimeout(() => {
              drawLinesWithDelay(index + 1);
            }, 100); // 0.2 second delay
          }
        };

        drawLinesWithDelay(0);

        setTimeout(() => {
          drawConvexHull(hull.slice(0, newStep + 1));
        }, 110 * points.length);
        setLog([
          ...log,
          `Step ${newStep}: Add point ${hull[
            newStep - 1
          ].toString()} to the hull`,
        ]);
      } else {
        const completedHull = [...hull, hull[0]];
        drawConvexHull(completedHull);
        setLog([
          ...log,
          `Step ${newStep}: Add point ${hull[
            hull.length - 1
          ].toString()} to the hull`,
        ]); //issue not printing the last point
      }

      console.log("This", newStep);

      // Check if all steps are completed
      if (newStep === hull.length) {
        setIsVisualizing(false);
        setIsForward(false);
        setLog([...log, "Convex hull completed"]);
      }

      return newStep;
    });
    console.log("dash", step);
  }

  function fastForward() {
    const svg = d3.select(svgRef.current);
    svg.selectAll("path").remove(); // Clear existing paths
    svg.selectAll("polygon").remove(); // Clear existing paths

    setIsVisualizing(true);
    setIsNext(false);
    setIsForward(false);

    console.log(isVisualizing);
    console.log(isReset);
    let currStep = 0;
    const playNextStep = () => {
      setIsReset(false);
      console.log(hull.length);
      if (currStep < hull.length) {
        console.log(currStep);
        currStep++;
        nextStep(); // Call nextStep with incremented step

        setTimeout(playNextStep, 140 * points.length); // Call playNextStep again after 0.5 seconds
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
      // svg.selectAll("*").remove();
      svg.selectAll("polygon").remove()
      svg.selectAll("path").remove()
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
      <h1 className="mt-4 mb-4">Convex Hull Visualization - Jarvis March</h1>
      <Row>
        <Col>
          {isCanvasOpen ? (
            <svg
              ref={svgRef}
              width="800"
              height="600"
              onClick={handleClick}
              style={{
                border: "1px solid rgba(169, 169, 169, 0.5)",
                borderRadius: "25px",
                width: "800px",
                height: "600px",
                padding: "10px",
              }} // Add border and rounded corners
            >
              {/* X-axis */}
              <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(192, 192, 192, 0.2)" />
              {/* Y-axis */}
              <line x1="400" y1="0" x2="400" y2="600" stroke="rgba(192, 192, 192, 0.2)" />
            </svg>
          ) : (
            <svg ref={svgRef} width="800" height="600">
              {/* X-axis */}
              <line x1="0" y1="300" x2="800" y2="300" stroke="rgba(192, 192, 192, 0.2)" />
              {/* Y-axis */}
              <line x1="400" y1="0" x2="400" y2="600" stroke="rgba(192, 192, 192, 0.2)" />
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
                  max="200"
                  value={numPoints}
                  disabled={isVisualizing || isCanvasOpen}
                  onChange={(e) => {
                    setNumPoints(parseInt(e.target.value, 10));
                    generateRandomPoints(parseInt(e.target.value, 10));
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
                  onClick={(isCanvasOpen) ? handleRefreshClick : null}
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
                disabled={!isVisualizing || step === hull.length || !isNext}
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
