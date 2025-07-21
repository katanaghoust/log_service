import re
from datetime import datetime
from pathlib import Path
import chardet


def parse_log_file(file_path: Path) -> list[dict]:
    # Регулярки
    re_version_alt = re.compile(r"Application version:\s*([^\s]+)")
    re_bandwidth = re.compile(r"usrp bandwidth:\s*([\d\.]+)\s*MHz")
    re_freq_start = re.compile(r"usrp frequency begin:\s*([\d\.]+)\s*MHz")
    re_freq_end = re.compile(r"usrp frequency end:\s*([\d\.]+)\s*MHz")
    re_freq_entry = re.compile(r"\[(.*?)\].*?Signal block attained\. Size: \d+, Frequency: (\d+)")
    re_detection_marker = re.compile(r"map_view::MapViewInterface::ShowPoints Start, point map size: 1")

    # Определение кодировки
    with open(file_path, 'rb') as f:
        raw_data = f.read()
        encoding = chardet.detect(raw_data)['encoding']
    lines = raw_data.decode(encoding).splitlines()

    version = bandwidth = freq_start = freq_end = None
    circle_counter = 0
    initial_circle_freq = None
    parsed_entries = []

    # Извлекаем общие параметры
    for line in lines:
        if version is None and (m := re_version_alt.search(line)):
            version = m.group(1)
        if bandwidth is None and (m := re_bandwidth.search(line)):
            bandwidth = float(m.group(1))
        if freq_start is None and (m := re_freq_start.search(line)):
            freq_start = float(m.group(1))
        if freq_end is None and (m := re_freq_end.search(line)):
            freq_end = float(m.group(1))
        if version and bandwidth and freq_start and freq_end:
            break


    i = 0
    while i < len(lines):
        line = lines[i]
        freq_match = re_freq_entry.search(line)

        if freq_match:
            timestamp_str, freq_raw = freq_match.groups()
            freq_mhz = int(freq_raw) / 1_000_000

            # Конвертация времени
            try:
                timestamp = datetime.strptime(timestamp_str.strip(), "%Y-%m-%d %H:%M:%S")
            except ValueError:
                timestamp = datetime.utcnow()

            # Новый круг
            if initial_circle_freq is None:
                initial_circle_freq = freq_mhz
                circle_counter = 1
            elif abs(freq_mhz - initial_circle_freq) < 0.001:
                circle_counter += 1

            j = i + 1
            while j < len(lines):
                if re_freq_entry.search(lines[j]):
                    break
                if re_detection_marker.search(lines[j]):
                    parsed_entries.append({
                        "version": version,
                        "bandwidth": bandwidth,
                        "freq_start": freq_start,
                        "freq_end": freq_end,
                        "circle_num": circle_counter,
                        "detected_freq": freq_mhz,
                        "timestamp": timestamp
                    })
                    break
                j += 1
        i += 1

    return parsed_entries
