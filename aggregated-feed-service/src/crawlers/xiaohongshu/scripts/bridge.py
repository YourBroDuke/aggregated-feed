# call js script by execjs
import json
import sys
import execjs
import os

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Change working directory to the scripts directory
os.chdir(current_dir)

# Load the JavaScript files
try:
    with open(os.path.join(current_dir, 'xhs_xs_xsc_56.cjs'), 'r', encoding='utf-8') as f:
        js_code = f.read()
    js = execjs.compile(js_code)
except Exception as e:
    print(f"Error loading xhs_xs_xsc_56.cjs: {str(e)}", file=sys.stderr)
    sys.exit(1)

try:
    with open(os.path.join(current_dir, 'xhs_xray.cjs'), 'r', encoding='utf-8') as f:
        xray_js_code = f.read()
    xray_js = execjs.compile(xray_js_code)
except Exception as e:
    print(f"Error loading xhs_xray.cjs: {str(e)}", file=sys.stderr)
    sys.exit(1)

def generate_xs_xs_common(a1, api, data=''):
    try:
        ret = js.call('get_request_headers_params', api, data, a1)
        return json.dumps({
            'xs': ret['xs'],
            'xt': ret['xt'],
            'xs_common': ret['xs_common']
        })
    except Exception as e:
        print(f"Error in generate_xs_xs_common: {str(e)}", file=sys.stderr)
        sys.exit(1)

def generate_xs(a1, api, data=''):
    try:
        ret = js.call('get_xs', api, data, a1)
        return json.dumps({
            'xs': ret['X-s'],
            'xt': ret['X-t']
        })
    except Exception as e:
        print(f"Error in generate_xs: {str(e)}", file=sys.stderr)
        sys.exit(1)

def generate_xray_traceid():
    try:
        return xray_js.call('traceId')
    except Exception as e:
        print(f"Error in generate_xray_traceid: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python bridge.py <function_name> [args...]", file=sys.stderr)
        sys.exit(1)

    function_name = sys.argv[1]
    args = sys.argv[2:]

    if function_name == 'generate_xs_xs_common':
        if len(args) != 3:
            print("Usage: python bridge.py generate_xs_xs_common <a1> <api> <data>", file=sys.stderr)
            sys.exit(1)
        print(generate_xs_xs_common(args[0], args[1], args[2]))
    elif function_name == 'generate_xs':
        if len(args) != 3:
            print("Usage: python bridge.py generate_xs <a1> <api> <data>", file=sys.stderr)
            sys.exit(1)
        print(generate_xs(args[0], args[1], args[2]))
    elif function_name == 'generate_xray_traceid':
        print(generate_xray_traceid())
    else:
        print(f"Unknown function: {function_name}", file=sys.stderr)
        sys.exit(1)