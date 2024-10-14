import React from "react";

import styles from "./container.module.scss";

type ContainerProps = {
  width?: "narrow" | "wide" | "fullscreen";
  mode?: "flex";
  children: React.ReactNode;
  className?: string;
};

const Container: React.FC<ContainerProps> = ({
  width,
  children,
  className,
}) => {
  let containerClassName = "";

  switch (width) {
    case "narrow":
      containerClassName = styles.narrow;
      break;
    case "wide":
      containerClassName = styles.wide;
      break;
    case "fullscreen":
      containerClassName = styles.fullscreen;
      break;
    default:
      break;
  }

  return (
    <div className={`${styles.container} ${containerClassName} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
