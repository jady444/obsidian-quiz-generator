import { Setting } from "obsidian";
import QuizGenerator from "../../main";
import { languages } from "./generalConfig";

const displayGeneralSettings = (containerEl: HTMLElement, plugin: QuizGenerator): void => {
	new Setting(containerEl)
		.setName("Show note path")
		.setDesc("Turn this off to only show the name of selected notes.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.showNotePath)
				.onChange(async (value) => {
					plugin.settings.showNotePath = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Show folder path")
		.setDesc("Turn this off to only show the name of selected folders.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.showFolderPath)
				.onChange(async (value) => {
					plugin.settings.showFolderPath = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Include notes in subfolders")
		.setDesc("Turn this off to only include notes in the selected folders.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.includeSubfolderNotes)
				.onChange(async (value) => {
					plugin.settings.includeSubfolderNotes = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Randomize question order")
		.setDesc("Turn this off to answer questions in their generated/saved order.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.randomizeQuestions)
				.onChange(async (value) => {
					plugin.settings.randomizeQuestions = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Language")
		.setDesc("Language questions are generated in.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(languages)
				.setValue(plugin.settings.language)
				.onChange(async (value: string) => {
					plugin.settings.language = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generate from linked notes")
		.setDesc("Automatically include content from directly linked notes.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateFromLinkedNotes)
				.onChange(async (value) => {
					plugin.settings.generateFromLinkedNotes = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Linked notes limit")
		.setDesc("Maximum number of linked notes to include.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.linkedNotesLimit)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.linkedNotesLimit = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);
};

export default displayGeneralSettings;
