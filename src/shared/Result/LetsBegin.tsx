import { ReactNode } from "react";

import { ButtonGroup } from "@chakra-ui/react";

import { t } from "utils";

import { RestFiltersButton } from "./Buttons";
import { InfoIcon } from "./Icons";
import { Result } from "./Result";

interface IProps {
  headingText: string;
}

const LetsBegin = ({ headingText }: IProps) => {
  return <Result image={<InfoIcon />} heading={t(headingText)} />;
};

export { LetsBegin };
