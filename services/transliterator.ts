type Dict = { [key: string]: string };

export default class Transliterator {
  cyrillic_to_latin: Dict;
  latin_to_forgot_switch_language: Dict;

  constructor() {
    this.cyrillic_to_latin = {
      // latin -> cyrillic dictionary
      Ё: "YO",
      Й: "I",
      Ц: "TS",
      У: "U",
      К: "K",
      Е: "E",
      Н: "N",
      Г: "G",
      Ш: "SH",
      Щ: "SH",
      З: "Z",
      Х: "H",
      Ъ: "'",
      й: "i",
      ц: "ts",
      у: "u",
      к: "k",
      е: "e",
      н: "n",
      г: "g",
      ш: "sh",
      щ: "sch",
      з: "z",
      х: "h",
      ъ: "'",
      Ф: "F",
      Ы: "I",
      В: "V",
      А: "a",
      П: "P",
      Р: "R",
      О: "O",
      Л: "L",
      Д: "D",
      Ж: "ZH",
      Э: "E",
      ф: "f",
      ы: "i",
      в: "v",
      а: "a",
      п: "p",
      р: "r",
      о: "o",
      л: "l",
      д: "d",
      ж: "zh",
      э: "e",
      Я: "Ya",
      Ч: "CH",
      С: "S",
      М: "M",
      И: "I",
      Т: "T",
      Ь: "'",
      Б: "B",
      Ю: "YU",
      я: "ya",
      ч: "ch",
      с: "s",
      м: "m",
      и: "i",
      т: "t",
      ь: "'",
      б: "b",
      ю: "yu",
      киви: "qiwi",
      нал: "cash",
      юсд: "usd",
      биток: "btc",
    };
    this.latin_to_forgot_switch_language = {
      // не та раскладка
      q: "й",
      w: "ц",
      e: "у",
      r: "к",
      t: "е",
      y: "н",
      u: "г",
      i: "ш",
      o: "щ",
      p: "з",
      "[": "х",
      "]": "ъ",
      a: "ф",
      s: "ы",
      d: "в",
      f: "а",
      g: "п",
      h: "р",
      j: "о",
      k: "л",
      l: "д",
      "'": "э",
      z: "я",
      x: "ч",
      c: "с",
      v: "м",
      b: "и",
      n: "т",
      m: "ь",
      ",": "б",
      ".": "ю",
    };
  }

  _swap = (json: Dict): Dict => {
    // меняет ключи со значениями
    let swapped = {} as Dict;
    for (let key in json) {
      if (json[key]) swapped[json[key]] = key;
    }
    return swapped;
  };

  _findWord = (word: string, dictionary: Dict): string => {
    // меняет ключи со значениями
    if (word && word.length > 1) {
      return (
        Object.keys(dictionary).find((key) => {
          return key.includes(word);
        }) || ""
      );
    }
    return "";
  };

  _convertToDict = (word: string, dictionary: Dict): string => {
    // если слэнг типа киви, нал, биток - возвращаем перевод
    const wordMatch = this._findWord(word, dictionary);
    if (wordMatch) {
      return dictionary[wordMatch];
    }
    // иначе посимвольно переводим
    let res = "";
    const invertedDictionary = this._swap(dictionary);

    for (let i in word.split("")) {
      if (dictionary[word[i]]) {
        res += dictionary[word[i]];
      } else if (invertedDictionary[word[i]]) {
        res += invertedDictionary[word[i]];
      } else {
        res += word[i];
      }
    }
    return res;
  };

  _transliterate = (
    word: string
  ): { cyrillic_to_latin: string; latin_to_forgot_switch_language: string } => {
    return {
      cyrillic_to_latin: this._convertToDict(word, this.cyrillic_to_latin),
      latin_to_forgot_switch_language: this._convertToDict(
        word,
        this.latin_to_forgot_switch_language
      ),
    };
  };

  findMatch = (pmFullName: string, userInput: string): boolean => {
    const nameParts = pmFullName.split(" "); // разбиваем название PM на слова

    for (let namePart of nameParts) {
      // берем каждое слово названия PM
      // если одно из слов начинается на введенную пользователем строку, то true
      if (namePart.toLowerCase().startsWith(userInput)) return true;
      // иначе пробуем перевести в транслит или забытую смену раскладки
      const transliteration = this._transliterate(userInput);
      if (namePart.toLowerCase().startsWith(transliteration.cyrillic_to_latin))
        return true;
      if (
        namePart
          .toLowerCase()
          .startsWith(transliteration.latin_to_forgot_switch_language)
      )
        return true;
    }
    return false;
  };
}
