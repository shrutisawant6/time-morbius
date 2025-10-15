import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import type { TimeZoneOption } from "./types/types";
import {
  getClockColor,
  calculateTimeZoneTime,
  formatTime,
  timeZones,
} from "./utils/utils";
import TimeZoneSelector from "./components/TimeZoneSelector";

const App: React.FC = () => {

  //#region Constants
  const [hours, setHours] = useState<number>(new Date().getHours());
  const [minutes, setMinutes] = useState<number>(new Date().getMinutes());
  const [seconds, setSeconds] = useState<number>(new Date().getSeconds());
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZoneOption>(
    timeZones[0]
  );

  const localClockRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<"hour" | "minute" | null>(null);

  const [lastAngle, setLastAngle] = useState(0);
  const [rotationCount, setRotationCount] = useState(0);
  const isCurrentPM = new Date().getHours() >= 12 ? true : false;
  const isPM = rotationCount === 0 ? isCurrentPM : (rotationCount % 2 === 1 ? !isCurrentPM : isCurrentPM);

  const center = { x: 150, y: 150 };
  const radius = 100;

  //#endregion 

  //ticking clock
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSec) => {
        let newSec = prevSec + 1;
        if (newSec >= 60) {
          newSec = 0;
          setMinutes((prevMin) => {
            let newMin = prevMin + 1;
            if (newMin >= 60) {
              newMin = 0;
              setHours((prevHour) => (prevHour + 1) % 24);
            }
            return newMin;
          });
        }
        return newSec;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // drag handlers
  const handleMouseDown = (hand: "hour" | "minute") => {
    dragging.current = hand;
  };

  const handleMouseUp = () => {
    dragging.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    //evaluate coordinates
    if (!dragging.current || !localClockRef.current) return;
    const rect = localClockRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - center.x;
    const y = e.clientY - rect.top - center.y;

    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;

    //set new time
    if (dragging.current === "hour") {
      const newHours = Math.floor(angle / 30) % 12;
      setHours(newHours);
    } else if (dragging.current === "minute") {
      const newMinutes = Math.floor(angle / 6) % 60;
      setMinutes(newMinutes);
    }

    //set rotations done to clock
    if (lastAngle > 300 && angle < 60) {
      setRotationCount((count) => count + 1);
    } else if (lastAngle < 60 && angle > 300) {
      setRotationCount((count) => Math.max(0, count - 1));
    }
    setLastAngle(angle);

  };

  //calculate selected timezone value
  const { tzHours, tzMinutes, tzSeconds, tzIsPM } = calculateTimeZoneTime(
    hours,
    minutes,
    seconds,
    selectedTimeZone.offset,
    isPM
  );

  //display clock
  const renderClock = (
    hours: number,
    minutes: number,
    seconds: number,
    isPMOrAm: boolean = false,
    clockRef?: React.RefObject<SVGSVGElement | null>,
    isDraggable: boolean = false
  ) => {
    const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    //evaluate time to be displayed
    const currentTime = formatTime(hours, minutes, seconds, isPMOrAm);

    return (
      <div style={{ display: "inline-block", margin: "20px" }}>
        <svg
          ref={clockRef || null}
          width="300"
          height="300"
          onMouseMove={isDraggable && clockRef ? (e) => handleMouseMove(e) : undefined}
          onMouseUp={isDraggable && clockRef ? handleMouseUp : undefined}
          onMouseLeave={isDraggable && clockRef ? handleMouseUp : undefined}
          style={{
            userSelect: "none",
            cursor: isDraggable && dragging.current ? "grabbing" : "default",
          }}
        >
          <circle
            cx={center.x}
            cy={center.y}
            r={radius}
            fill={getClockColor(hours, minutes, isPMOrAm)}
            stroke="darkgrey"
            strokeWidth="12"
          />
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x + radius * 0.5 * Math.sin((hourAngle * Math.PI) / 180)}
            y2={center.y - radius * 0.5 * Math.cos((hourAngle * Math.PI) / 180)}
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            onMouseDown={isDraggable ? () => handleMouseDown("hour") : undefined}
          />
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x + radius * 0.8 * Math.sin((minuteAngle * Math.PI) / 180)}
            y2={center.y - radius * 0.8 * Math.cos((minuteAngle * Math.PI) / 180)}
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1={center.x}
            y1={center.y}
            x2={center.x + radius * 0.9 * Math.sin((secondAngle * Math.PI) / 180)}
            y2={center.y - radius * 0.9 * Math.cos((secondAngle * Math.PI) / 180)}
            stroke="darksalmon"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={center.x} cy={center.y} r="5" fill="white" />
        </svg>
        <p className="text-style">{currentTime}</p>
      </div>
    );
  };

  return (
    <div className="App text-align-center">
      <div> 
        <h1>Time Morbius</h1>
      </div>

        <TimeZoneSelector
          timeZones={timeZones}
          selectedTimeZone={selectedTimeZone}
          onChange={setSelectedTimeZone}
        />

        {/* Local clock */}
        {renderClock(hours, minutes, seconds, isPM, localClockRef, true)}
        {/* Timezone clock */}
        {renderClock(tzHours, tzMinutes, tzSeconds, tzIsPM)}
    </div>
  );
};

export default App;
