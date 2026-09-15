import { memo } from "react";
import { Card, CardBody } from "@heroui/card";

import { BLACK_LABEL_CLASS } from "./shared/constants";

interface Props {
  line: string;
  model: string;
}

export const LineModelInfo = memo(({ line, model }: Props) => {
  return (
    <Card className="flex-1" radius="none" shadow="none">
      <CardBody className="grid grid-cols-[200px_1fr] grid-rows-2 p-0 h-full">
        <div
          className={`${BLACK_LABEL_CLASS} border-b border-r border-gray-800`}
        >
          LINE
        </div>
        <div className="flex items-center justify-center text-8xl font-bold border-b border-gray-800">
          {line}
        </div>
        <div className={`${BLACK_LABEL_CLASS} border border-gray-800`}>
          MODEL
        </div>
        <div className="flex items-center justify-center text-8xl font-bold border-b border-gray-800">
          {model}
        </div>
      </CardBody>
    </Card>
  );
});

LineModelInfo.displayName = "LineModelInfo";
