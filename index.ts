import _ from "lodash";
import open from "open";
import { fromNullable } from "fp-ts/lib/Option";

import { cli, main } from "./cli";

const {
  input,
  flags,
  help
} = cli;

const commandOpt = fromNullable(_(input).first())
  .map(command => main(command, cli));

if (commandOpt.isNone()) {
  cli.showHelp()
}