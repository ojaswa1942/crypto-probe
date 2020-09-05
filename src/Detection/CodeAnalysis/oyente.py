#!/usr/bin/env python

import shlex
import subprocess
import os
import re
import argparse
import logging
import requests
import symExec
import global_params
from source_map import SourceMap
from utils import run_command

def cmd_exists(cmd):
    return subprocess.call("type " + cmd, shell=True,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE) == 0


def has_dependencies_installed():
    try:
        import z3
        import z3.z3util
        if z3.get_version_string() != '4.5.0':
            logging.warning("You are using an untested version of z3. 4.5.0 is the officially tested version")
    except:
        logging.critical("Z3 is not available. Please install z3 from https://github.com/Z3Prover/z3.")
        return False

    if not cmd_exists("evm"):
        logging.critical("Please install evm from go-ethereum and make sure it is in the path.")
        return False
    else:
        cmd = "evm --version"
        out = run_command(cmd).strip()
        version = re.findall(r"evm version (\d*.\d*.\d*)", out)[0]
        if version != '1.6.6':
            logging.warning("You are using evm version %s. The supported version is 1.6.6" % version)

    if not cmd_exists("solc"):
        logging.critical("solc is missing. Please install the solidity compiler and make sure solc is in the path.")
        return False
    else:
        cmd = "solc --version"
        out = run_command(cmd).strip()
        version = re.findall(r"Version: (\d*.\d*.\d*)", out)[0]
        if version != '0.4.17':
            logging.warning("You are using solc version %s, The latest supported version is 0.4.17" % version)

    return True


def removeSwarmHash(evm):
    evm_without_hash = re.sub(r"a165627a7a72305820\S{64}0029$", "", evm)
    return evm_without_hash

def extract_bin_str(s):
    binary_regex = r"\n======= (.*?) =======\nBinary of the runtime part: \n(.*?)\n"
    contracts = re.findall(binary_regex, s)
    contracts = [contract for contract in contracts if contract[1]]
    if not contracts:
        logging.critical("Solidity compilation failed")
        print "======= error ======="
        print "Solidity compilation failed"
        exit()
    return contracts

def compileContracts(contract):
    cmd = "solc --bin-runtime %s" % contract
    out = run_command(cmd)

    libs = re.findall(r"_+(.*?)_+", out)
    libs = set(libs)
    if libs:
        return link_libraries(contract, libs)
    else:
        return extract_bin_str(out)


def link_libraries(filename, libs):
    option = ""
    for idx, lib in enumerate(libs):
        lib_address = "0x" + hex(idx+1)[2:].zfill(40)
        option += " --libraries %s:%s" % (lib, lib_address)
    FNULL = open(os.devnull, 'w')
    cmd = "solc --bin-runtime %s" % filename
    p1 = subprocess.Popen(shlex.split(cmd), stdout=subprocess.PIPE, stderr=FNULL)
    cmd = "solc --link%s" %option
    p2 = subprocess.Popen(shlex.split(cmd), stdin=p1.stdout, stdout=subprocess.PIPE, stderr=FNULL)
    p1.stdout.close()
    out = p2.communicate()[0]
    return extract_bin_str(out)

def analyze(processed_evm_file, disasm_file, source_map = None):
    disasm_out = ""
    try:
        disasm_p = subprocess.Popen(
            ["evm", "disasm", processed_evm_file], stdout=subprocess.PIPE)
        disasm_out = disasm_p.communicate()[0]
    except:
        logging.critical("Disassembly failed.")
        exit()

    with open(disasm_file, 'w') as of:
        of.write(disasm_out)

    # Run symExec
    if source_map != None:
        symExec.main(disasm_file, args.source, source_map)
    else:
        symExec.main(disasm_file, args.source)

def remove_temporary_file(path):
    if os.path.isfile(path):
        os.unlink(path)

def main():
    # TODO: Implement -o switch.

    global args

    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("-s", "--source", type=str,
                       help="local source file name. Solidity by default. Use -b to process evm instead. Use stdin to read from stdin.")
    group.add_argument("-ru", "--remoteURL", type=str,
                       help="Get contract from remote URL. Solidity by default. Use -b to process evm instead.", dest="remote_URL")

    parser.add_argument("--version", action="version", version="oyente version 0.2.7 - Commonwealth")
    parser.add_argument(
        "-b", "--bytecode", help="read bytecode in source instead of solidity file.", action="store_true")

    parser.add_argument(
        "-j", "--json", help="Redirect results to a json file.", action="store_true")
    parser.add_argument(
        "-e", "--evm", help="Do not remove the .evm file.", action="store_true")
    parser.add_argument(
        "-p", "--paths", help="Print path condition information.", action="store_true")
    parser.add_argument(
        "--error", help="Enable exceptions and print output. Monsters here.", action="store_true")
    parser.add_argument("-t", "--timeout", type=int, help="Timeout for Z3 in ms.")
    parser.add_argument(
        "-v", "--verbose", help="Verbose output, print everything.", action="store_true")
    parser.add_argument(
        "-r", "--report", help="Create .report file.", action="store_true")
    parser.add_argument("-gb", "--globalblockchain",
                        help="Integrate with the global ethereum blockchain", action="store_true")
    parser.add_argument("-dl", "--depthlimit", help="Limit DFS depth",
                        action="store", dest="depth_limit", type=int)
    parser.add_argument("-gl", "--gaslimit", help="Limit Gas",
                        action="store", dest="gas_limit", type=int)
    parser.add_argument(
        "-st", "--state", help="Get input state from state.json", action="store_true")
    parser.add_argument("-ll", "--looplimit", help="Limit number of loops",
                        action="store", dest="loop_limit", type=int)
    parser.add_argument(
        "-w", "--web", help="Run Oyente for web service", action="store_true")
    parser.add_argument("-glt", "--global-timeout", help="Timeout for symbolic execution", action="store", dest="global_timeout", type=int)
    parser.add_argument(
        "-a", "--assertion", help="Check assertion failures.", action="store_true")
    parser.add_argument(
            "--debug", help="Display debug information", action="store_true")
    parser.add_argument(
        "--generate-test-cases", help="Generate test cases each branch of symbolic execution tree", action="store_true")

    args = parser.parse_args()

    if args.timeout:
        global_params.TIMEOUT = args.timeout

    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)
    global_params.PRINT_PATHS = 1 if args.paths else 0
    global_params.REPORT_MODE = 1 if args.report else 0
    global_params.IGNORE_EXCEPTIONS = 1 if args.error else 0
    global_params.USE_GLOBAL_BLOCKCHAIN = 1 if args.globalblockchain else 0
    global_params.INPUT_STATE = 1 if args.state else 0
    global_params.WEB = 1 if args.web else 0
    global_params.STORE_RESULT = 1 if args.json else 0
    global_params.CHECK_ASSERTIONS = 1 if args.assertion else 0
    global_params.DEBUG_MODE = 1 if args.debug else 0
    global_params.GENERATE_TEST_CASES = 1 if args.generate_test_cases else 0

    if args.depth_limit:
        global_params.DEPTH_LIMIT = args.depth_limit
    if args.gas_limit:
        global_params.GAS_LIMIT = args.gas_limit
    if args.loop_limit:
        global_params.LOOP_LIMIT = args.loop_limit
    if global_params.WEB:
        if args.global_timeout and args.global_timeout < global_params.GLOBAL_TIMEOUT:
            global_params.GLOBAL_TIMEOUT = args.global_timeout
    else:
        if args.global_timeout:
            global_params.GLOBAL_TIMEOUT = args.global_timeout

    if not has_dependencies_installed():
        return

    if args.remote_URL:
        r = requests.get(args.remote_URL)
        code = r.text
        filename = "remote_contract.evm" if args.bytecode else "remote_contract.sol"
        args.source = filename
        with open(filename, 'w') as f:
            f.write(code)

    if args.bytecode:
        processed_evm_file = args.source + '.1'
        disasm_file = args.source + '.disasm'
        with open(args.source) as f:
            evm = f.read()

        with open(processed_evm_file, 'w') as f:
            f.write(removeSwarmHash(evm))

        analyze(processed_evm_file, disasm_file)

        remove_temporary_file(disasm_file)
        remove_temporary_file(processed_evm_file)

        if global_params.UNIT_TEST == 2 or global_params.UNIT_TEST == 3:
            exit_code = os.WEXITSTATUS(cmd)
            if exit_code != 0:
                exit(exit_code)
    else:
        if os.path.isfile("bug_found"):
            os.remove("bug_found")

        contracts = compileContracts(args.source)

        for cname, bin_str in contracts:
            logging.info("Contract %s:", cname)
            processed_evm_file = cname + '.evm'
            disasm_file = cname + '.evm.disasm'

            with open(processed_evm_file, 'w') as of:
                of.write(removeSwarmHash(bin_str))

            analyze(processed_evm_file, disasm_file, SourceMap(cname, args.source))

            if args.evm:
                with open(processed_evm_file, 'w') as of:
                    of.write(bin_str)

            remove_temporary_file(processed_evm_file)
            remove_temporary_file(disasm_file)
            remove_temporary_file(disasm_file + '.log')
        if os.path.isfile("bug_found"):
            os.remove("bug_found")
            exit(1)

if __name__ == '__main__':
    main()
