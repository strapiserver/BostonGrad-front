import {
  Button,
  ButtonProps,
  Box,
  HStack,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Select,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import { IImage } from "../../types/selector";
import CustomImage from "./CustomImage";

type Option = {
  value: string;
  label: string;
  icon?: IImage | null;
};

type CustomSelectProps = Omit<ButtonProps, "children"> & {
  name: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  autoSelectFirst?: boolean;
  leftIcon?: ReactNode;
  showSelectedIcon?: boolean;
};

export default function CustomSelect({
  name,
  options,
  placeholder,
  defaultValue,
  autoSelectFirst = true,
  leftIcon,
  showSelectedIcon = true,
  ...props
}: CustomSelectProps) {
  const { onChange: _unusedOnChange, ...sharedProps } = props;
  const initialValue = defaultValue || "";
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value) return;
    if (defaultValue) {
      setValue(defaultValue);
      return;
    }
    if (autoSelectFirst && options.length > 0) {
      setValue(options[0].value);
    }
  }, [autoSelectFirst, defaultValue, options, value]);

  const selectedOption = useMemo(() => {
    if (!value) return "";
    return options.find((option) => option.value === value) || "";
  }, [options, value]);

  const renderIcon = (icon?: IImage | null) =>
    icon ? (
      <Box
        w="22px"
        h="22px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        <CustomImage img={icon} w="22px" h="22px" objectFit="contain" />
      </Box>
    ) : null;

  return (
    <>
      <input type="hidden" name={name} value={value} />
      {isMobile ? (
        <InputGroup>
          {leftIcon ? (
            <InputLeftElement h={sharedProps.h || sharedProps.height || "100%"}>
              {leftIcon}
            </InputLeftElement>
          ) : null}
          <Select
            w="100%"
            name={`${name}_visible`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            icon={<RiArrowDownSLine />}
            fontWeight="normal"
            pl={leftIcon ? "10" : undefined}
            {...(sharedProps as any)}
          >
            <option value="" disabled>
              {placeholder || ""}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </InputGroup>
      ) : !mounted ? (
        <Button
          w="100%"
          justifyContent="space-between"
          textAlign="left"
          rightIcon={<RiArrowDownSLine />}
          fontWeight="normal"
          {...sharedProps}
        >
          <HStack spacing="2" minW={0}>
            {leftIcon || null}
            <Text noOfLines={1}>{placeholder || ""}</Text>
          </HStack>
        </Button>
      ) : (
        <Menu matchWidth placement="bottom-start">
          <MenuButton
            as={Button}
            w="100%"
            justifyContent="space-between"
            textAlign="left"
            rightIcon={<RiArrowDownSLine />}
            fontWeight="normal"
            {...sharedProps}
          >
            {selectedOption ? (
              <HStack spacing="2" minW={0}>
                {leftIcon || null}
                {showSelectedIcon ? renderIcon(selectedOption.icon) : null}
                <Text noOfLines={1}>{selectedOption.label}</Text>
              </HStack>
            ) : (
              <HStack spacing="2" minW={0}>
                {leftIcon || null}
                <Text noOfLines={1}>{placeholder || ""}</Text>
              </HStack>
            )}
          </MenuButton>
          <Portal>
            <MenuList bg="white" borderColor="red.400" textAlign="left" zIndex={2000}>
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  bg="white"
                  color="black"
                  _hover={{ bg: "red.500", color: "white" }}
                  _focus={{ bg: "red.500", color: "white" }}
                  onClick={() => setValue(option.value)}
                >
                  <HStack spacing="2" minW={0}>
                    {renderIcon(option.icon)}
                    <Text noOfLines={1}>{option.label}</Text>
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Portal>
        </Menu>
      )}
    </>
  );
}
