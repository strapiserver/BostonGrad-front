import {
  Button,
  ButtonProps,
  Box,
  HStack,
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

type CustomSelectProps = Omit<ButtonProps, "children" | "onChange"> & {
  name: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  autoSelectFirst?: boolean;
  leftIcon?: ReactNode;
  showSelectedIcon?: boolean;
  onValueChange?: (option: Option) => void;
};

export default function CustomSelect({
  name,
  options,
  placeholder,
  defaultValue,
  autoSelectFirst = true,
  leftIcon,
  showSelectedIcon = true,
  onValueChange,
  ...props
}: CustomSelectProps) {
  const sharedProps = props;
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

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue);
    const nextOption = options.find((option) => option.value === nextValue);
    if (nextOption) {
      onValueChange?.(nextOption);
    }
  };

  return (
    <>
      <input type="hidden" name={name} value={value} />
      {isMobile ? (
        <Box position="relative" w="100%">
          {leftIcon ? (
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              zIndex={1}
              pointerEvents="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="inherit"
            >
              {leftIcon}
            </Box>
          ) : null}
          <Select
            w="100%"
            name={`${name}_visible`}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
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
        </Box>
      ) : !mounted ? (
        <Box position="relative" w="100%">
          {leftIcon ? (
            <Box
              position="absolute"
              left="12px"
              top="50%"
              transform="translateY(-50%)"
              zIndex={1}
              pointerEvents="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="inherit"
            >
              {leftIcon}
            </Box>
          ) : null}
          <Button
            w="100%"
            justifyContent="space-between"
            textAlign="left"
            rightIcon={<RiArrowDownSLine />}
            fontWeight="normal"
            pl={leftIcon ? "10" : undefined}
            {...sharedProps}
          >
            <HStack spacing="2" minW={0}>
              <Text noOfLines={1}>{placeholder || ""}</Text>
            </HStack>
          </Button>
        </Box>
      ) : (
        <Menu matchWidth placement="bottom-start">
          <Box position="relative" w="100%">
            {leftIcon ? (
              <Box
                position="absolute"
                left="12px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
                pointerEvents="none"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="inherit"
              >
                {leftIcon}
              </Box>
            ) : null}
            <MenuButton
              as={Button}
              w="100%"
              justifyContent="space-between"
              textAlign="left"
              rightIcon={<RiArrowDownSLine />}
              fontWeight="normal"
              pl={leftIcon ? "10" : undefined}
              {...sharedProps}
            >
              {selectedOption ? (
                <HStack spacing="2" minW={0}>
                  {showSelectedIcon ? renderIcon(selectedOption.icon) : null}
                  <Text noOfLines={1}>{selectedOption.label}</Text>
                </HStack>
              ) : (
                <HStack spacing="2" minW={0}>
                  <Text noOfLines={1}>{placeholder || ""}</Text>
                </HStack>
              )}
            </MenuButton>
          </Box>
          <Portal>
            <MenuList bg="white" borderColor="red.400" textAlign="left" zIndex={2000}>
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  bg="white"
                  color="black"
                  _hover={{ bg: "red.500", color: "white" }}
                  _focus={{ bg: "red.500", color: "white" }}
                  onClick={() => handleValueChange(option.value)}
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
