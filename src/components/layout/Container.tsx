import { cn } from "@/lib/utils";

interface ContainerProps extends React.ComponentProps<"div"> {}

const Container = ({ children, className, ...props }: ContainerProps) => {
  return (
    <div
      {...props}
      className={cn(
        "max-w-6xl mx-auto px-5 break-words overflow-wrap-normal",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
