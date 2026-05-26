import { redirect } from "next/navigation";

/**
 * /tools/journal-template-generator is the old URL.
 * Permanently redirect to the current tool page.
 */
export default function JournalTemplateGeneratorRedirect() {
  redirect("/tools/trade-journal-template");
}
