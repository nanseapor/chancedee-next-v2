"use client";

import { useEffect, useState } from "react";

import TermsAndConditions from "./TermsAndConditions";

const TACServer = () => {
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    // submit terms and conditions check to server
  }, [checked]);

  return (
    <div>
      <TermsAndConditions checked={checked} setChecked={setChecked} />
    </div>
  );
};

export default TACServer;
