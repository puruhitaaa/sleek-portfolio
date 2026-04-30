"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <span>{format(time, "MMM d, h:mm:ss a")}</span>;
};

export default RealTimeClock;
