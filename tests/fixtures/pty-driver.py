"""Runs a command inside a real pseudo-terminal, types lines into it one keystroke at a time,
and writes everything the program displayed to stdout (raw bytes, escape codes included).

Usage: python3 pty-driver.py <columns> <command...>   (lines to type are read from stdin)
POSIX only. Used by tests/integration/repl-tty.test.ts.
"""
import fcntl, os, pty, select, struct, sys, termios, time

columns = int(sys.argv[1])
command = sys.argv[2:]
lines = sys.stdin.read().split('\n')

pid, fd = pty.fork()
if pid == 0:
    os.execvp(command[0], command)

fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack('HHHH', 24, columns, 0, 0))
captured = bytearray()

def pump(seconds):
    deadline = time.time() + seconds
    while time.time() < deadline:
        ready, _, _ = select.select([fd], [], [], 0.05)
        if ready:
            try:
                chunk = os.read(fd, 4096)
            except OSError:
                return False
            if not chunk:
                return False
            captured.extend(chunk)
    return True

pump(1.5)
for line in lines:
    if not line:
        continue
    for ch in line:
        os.write(fd, ch.encode('utf-8'))
        pump(0.005)
    os.write(fd, b'\r')
    if not pump(0.5):
        break
pump(0.5)
sys.stdout.buffer.write(bytes(captured))
