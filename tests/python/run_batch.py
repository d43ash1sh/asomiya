"""Runs translated programs for the differential tests: one JSON job list in, results out."""
import io
import json
import signal
import sys

sys.setrecursionlimit(50000)


class Timeout(BaseException):
    pass


def on_alarm(signum, frame):
    raise Timeout("the program ran too long")


signal.signal(signal.SIGALRM, on_alarm)


class FakeStdin:
    def __init__(self, text):
        self.buffer = io.BytesIO(text.encode("utf-8"))

    def readline(self):
        return self.buffer.readline().decode("utf-8")


def main():
    jobs = json.load(sys.stdin)
    real_stdout, real_stdin = sys.stdout, sys.stdin
    results = []
    for job in jobs:
        out = io.StringIO()
        error = None
        try:
            code = compile(job["source"], "program.py", "exec")
        except SyntaxError as e:
            error = {"type": "SyntaxError", "message": f"{e.msg} (line {e.lineno})"}
        else:
            sys.stdout, sys.stdin = out, FakeStdin(job["stdin"])
            signal.setitimer(signal.ITIMER_REAL, 3)
            try:
                exec(code, {"__name__": "__main__"})
            except BaseException as e:  # noqa: BLE001 - the test compares any failure
                error = {"type": type(e).__name__, "message": str(e)[:300]}
            finally:
                signal.setitimer(signal.ITIMER_REAL, 0)
                sys.stdout, sys.stdin = real_stdout, real_stdin
        results.append({"output": out.getvalue(), "error": error})
    json.dump(results, real_stdout)


main()
