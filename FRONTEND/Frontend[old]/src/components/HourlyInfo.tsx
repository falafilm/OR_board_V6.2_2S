import { memo } from "react";
import { Card, CardBody } from "@heroui/card";

import {
  BLACK_LABEL_CLASS,
  HEADER_CLASS,
  VALUE_CLASS,
} from "./shared/constants";

interface Props {
  plan: number;
  actual: number;
}

export const HourlyInfo = memo(({ plan, actual }: Props) => {
  return (
    <Card className="flex-1" radius="none" shadow="none">
      <CardBody className="grid grid-cols-[300px_1fr_1fr] p-0 h-full">
        <div className={`${BLACK_LABEL_CLASS} border border-gray-800`}>
          INFORMATION
          <br />
          (HOUR)
        </div>

        <div className="flex flex-col border border-gray-800">
          <div className={HEADER_CLASS}>PLAN PCS. / HOUR</div>
          <div
            className={`text-9xl ${VALUE_CLASS} flex-1 flex items-center justify-center`}
          >
            {plan}
          </div>
        </div>

        <div className="flex flex-col border-t-2 border-b-2 border-gray-800">
          <div className={`${HEADER_CLASS} text-[#3F51B5]`}>
            ACTUAL PCS. / HOUR
          </div>
          <div
            className={`text-9xl ${VALUE_CLASS} text-[#3F51B5] flex-1 flex items-center justify-center`}
          >
            {actual}
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

HourlyInfo.displayName = "HourlyInfo";
