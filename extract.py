from datetime import datetime
import csv, json, os, re



def format_text(text):
    accents = {
        'a': ['à', 'ã', 'á', 'â'],
        'e': ['é', 'è', 'ê', 'ë'],
        'i': ['î', 'ï'],
        'u': ['ù', 'ü', 'û'],
        'o': ['ô', 'ö'],
        '': ['\'', '(', ')', '"']
    }
    text = str(text).strip().lower()
    for (char, special_chars) in accents.items():
        for special in special_chars:
            text = text.replace(special, char)
    return text


def check_if_files_exists():
    if not(os.path.exists("data")):
        os.mkdir("data")

    for file_path in ["data/merge_words.txt", "data/pixels_words.txt"]:
        if not(os.path.exists(file_path)):
            with open(file_path, 'w'):
                pass


def generate_sentences(splitted_word):
        if len(splitted_word) == 1:
            return splitted_word[0]
        else:
            phrases = []
            mots_suivants = generate_sentences(splitted_word[1:])
            for mot in splitted_word[0]:
                for mot_suivant in mots_suivants:
                    phrases.append(mot + " " + mot_suivant)
            return phrases


def parse_sentence(raw_sentence):
    splitted_word = raw_sentence.split(' ')
    for i in range(len(splitted_word)):
        splitted_word[i] = splitted_word[i].split(',')
    all_sentences = generate_sentences(splitted_word)
    for i in range(len(all_sentences)):
        all_sentences[i] = all_sentences[i].replace('-', ' ')
    return all_sentences


def merge_data(merge_words, args):
    merged_data = {}
    for data_to_merge in args:
        for key, value in data_to_merge.items():
            if key in merged_data:
                merged_data[key].extend(value)
            else:
                merged_data[key] = value

    # Merge words
    filtered_data = {}
    for key, value in merge_words.items():
        filtered_data[key] = []
        values_cleaned = [format_text(word) for word in value]
        for val in values_cleaned:
            merged_data_keys = list(merged_data.keys())
            for data_key in merged_data_keys:
                if val == format_text(data_key):
                    filtered_data[key].extend(merged_data[data_key])
                    merged_data.pop(data_key)
                    
    # Add the rest
    for key, value in merged_data.items():
        found = False
        for data_key in filtered_data.keys():
            if format_text(key) == format_text(data_key):
                filtered_data[data_key].extend(value)
                found = True
                break
        if not(found):
            filtered_data[key] = value

    # Remove duplicates
    for key, value in filtered_data.items():
        filtered_data[key] = list(set(value))
        filtered_data[key].sort()
    
    return filtered_data




def parse_habits(file_path):
    csv_content = open(file_path, 'r', encoding='utf-8').read()
    csv_lines = csv_content.strip().split("\n")
    reader = csv.DictReader(csv_lines)

    habits = {}
    for row in reader:
        date = row['Date']
        for key, value in row.items():
            if key != 'Date':
                if value == '2':
                    if key in habits:
                        habits[key].append(date)
                    else:
                        habits[key] = [date]
                elif value == '3':
                    if key+'_skip' in habits:
                        habits[key+'_skip'].append(date)
                    else:
                        habits[key+'_skip'] = [date]

    return habits


def parse_tally(file_path):
    csv_content = open(file_path, 'r', encoding='utf-8').read()
    csv_lines = csv_content.strip().split("\n")
    reader = csv.DictReader(csv_lines)

    counter_name = ''
    tally = []
    for row in reader:
        counter_name = row["Counter Name"]
        if row["Count Action"] == "1":
            timestamp = row['Timestamp']
            # date with format "YYYY-MM-DD"
            date = timestamp.split(' ')[0]
            tally.append(date)

    return {counter_name: tally}



class Pixel:

    def __init__(self, pixel: dict = None):
        self.date = str(datetime.strptime(pixel["date"], "%Y-%m-%d")).split(" ")[0]
        self.pixel_type = pixel["type"]
        self.scores = pixel["scores"]
        self.notes = format_text(pixel["notes"])
        self.tags = self.get_tags(pixel["tags"])
        self.raw_tags = pixel["tags"]


    def get_tags(self, tags_raw: list):
        tags = []
        for category in tags_raw:
            categoryName = category["type"]
            for entry in category["entries"]:
                tags.append((categoryName, entry))

        return tags



def parse_pixels(file_path, words_to_extract=[]):
    with open(file_path, 'r', encoding='utf-8') as f:
        pixels = json.load(f)

    parsed_pixels = []
    for pixel in pixels:
        parsed_pixel = Pixel(pixel)
        parsed_pixels.append(parsed_pixel)

    parsed_words = {}
    for word in words_to_extract:
        clean_word = format_text(word)
        for pixel in parsed_pixels:
            found = False
            pattern = re.compile(fr'\b{re.escape(clean_word)}\b') # Whole word only
            # if clean_word in pixel.notes:
            if re.search(pattern, pixel.notes):
                found = True
            if not found:
                for tag in pixel.tags:
                    if tag[1] == clean_word:
                        found = True
                        break
            if found:
                if word in parsed_words:
                    parsed_words[word].append(pixel.date)
                else:
                    parsed_words[word] = [pixel.date]

    return parsed_words



def clean_data(data, to_clean=[]):
    for clean in to_clean:
        if clean in data:
            data.pop(clean)
    return data



def write_parsed_data(data, file_path, write_keys=False):
    if len(data) > 0:
        # Export data to js file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("var parsedData = ")
            f.write(json.dumps(data, ensure_ascii=False, indent=4))

        if write_keys:
            with open("data/keys.txt", 'w', encoding='utf-8') as f:
                f.write(', '.join(data.keys()))
        print(f"Data exported to {file_path}")
    else:
        print("No data found")


def export_to_pixel_data(data, file_path):
    pixels = {}

    for habit, dates in data.items():
        for date in dates:
            if (date not in pixels):
                pixels[date] = {
                    "date": date,
                    "type": "Mood",
                    "scores": [3], # todo
                    "notes": "",
                    "tags": [
                        {
                            "type": "Tracking",
                            "entries": []
                        }
                    ]
                }
            pixels[date]["tags"][0]["entries"].append(habit)

    pixels_list = list(pixels.values())

    if (len(pixels_list) > 0):
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(json.dumps(pixels_list, ensure_ascii=False, indent=4))
        print(f"Data converted to {file_path}")


def auto_parse_all(dataDirectory):

    check_if_files_exists()

    # Parse merge_words
    merge_words = {}
    with open(f"{dataDirectory}/merge_words.txt", 'r', encoding='utf-8') as f:
        for line in f:
            key, values = line.strip().split(":")
            splitted_values = values.split(";")
            for word in splitted_values:
                parsed_phrases = parse_sentence(word)
                for phrase in parsed_phrases:
                    if key in merge_words:
                        merge_words[key].append(phrase)
                    else:
                        merge_words[key] = [phrase]

    # Parse pixels_words
    pixels_words = []
    with open(f"{dataDirectory}/pixels_words.txt", 'r', encoding='utf-8') as f:
        for line in f:
            parsed_phrases = parse_sentence(line.strip())
            for word in parsed_phrases:
                pixels_words.append(word)


    parsed_data = []
    for root, _, files in os.walk(dataDirectory):
        for file in files:
            fullFilePath = os.path.join(root, file)
            if file.startswith("counter_export"):
                data = parse_tally(fullFilePath)
                parsed_data.append(data)
            elif file.startswith("Checkmarks"):
                data = parse_habits(fullFilePath)
                parsed_data.append(data)
            elif file.startswith("PIXELS"):
                data = parse_pixels(fullFilePath, pixels_words)
                parsed_data.append(data)

    data = merge_data(merge_words, parsed_data)
    write_parsed_data(data, f"{dataDirectory}/data.js")
    export_to_pixel_data(data, f"{dataDirectory}/habits_pixels.json")




if __name__ == "__main__":

    dataRootDirectory = "data"
    auto_parse_all(dataRootDirectory)