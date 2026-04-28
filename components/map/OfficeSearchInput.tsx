import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { MdOutlineClear } from "react-icons/md";
import { RiSearchLine } from "react-icons/ri";

type OfficeSearchInputProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

const OfficeSearchInput = ({
  value,
  onChange,
  placeholder = "Поиск офиса",
}: OfficeSearchInputProps) => {
  const isEmptyInput = value.trim().length === 0;

  return (
    <InputGroup maxW={{ lg: "320px", base: "100%" }}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        variant="filled"
        borderWidth="2px"
        borderRadius="xl"
        borderColor="bg.500"
        focusBorderColor="violet.500"
        _hover={{ bg: "bg.800" }}
        pr="3rem"
      />
      <InputRightElement width="2.5rem">
        <IconButton
          aria-label={isEmptyInput ? "search" : "clear"}
          size="sm"
          variant="ghost"
          color="bg.500"
          _hover={{ color: "violet.500" }}
          icon={
            isEmptyInput ? (
              <RiSearchLine size="1rem" />
            ) : (
              <MdOutlineClear size="1rem" />
            )
          }
          onClick={() => {
            if (!isEmptyInput) {
              onChange("");
            }
          }}
        />
      </InputRightElement>
    </InputGroup>
  );
};

export default OfficeSearchInput;
