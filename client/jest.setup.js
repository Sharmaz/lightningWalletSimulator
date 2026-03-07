import { TextDecoder, TextEncoder } from "util";

import "@testing-library/jest-dom";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
