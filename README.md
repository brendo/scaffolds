# Scaffolds

Scaffolds allows you to quickly create Sections from a file. Section definitions can be exported and then imported into other Symphony installations using JSON. Definitions can be saved and reused on other Symphony projects to save you time recreating those common sections.

- Version: 0.1
- Date: unreleased
- Requirements: Symphony 2.2 or newer, <http://github.com/symphonycms/symphony-2/>, a Browser that supports the [FileReader API](https://developer.mozilla.org/en/DOM/FileReader)
- Author: Brendan Abbott, brendan@bloodbone.ws
- GitHub Repository: <http://github.com/brendo/scaffolds>

## Installation

1. Upload the 'scaffolds' folder (or checkout from git) to your Symphony 'extensions' folder.
2. Enable it by selecting the "Scaffolds" on the Extensions page and choose Enable/Install from the with-selected menu, then click Apply.
3. You when creating, or editing, Sections, you will now be able to Import a definition. When a Section has been saved, you will also be able to Export it for reuse

For further information, please refer to the [wiki](https://github.com/brendo/scaffolds/wiki).

## Notes

* This extension makes use of the [FileReader API](https://developer.mozilla.org/en/DOM/FileReader) to parse the files without actually uploading them a destination. At the time of release, this is only supported by Firefox and Chrome.
* The only valid file that can be parsed at the moment is JSON, with the file extension of `.json`.
* Checkbox values accept 'yes' and 'no' for 'checked' or 'unchecked', just like Symphony.

## Credits

Thanks to **@czheng** for the initial idea, at least for the name, some many moons ago.