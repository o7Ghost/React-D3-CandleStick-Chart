import { useState, ChangeEvent } from "react";
import "./App.css";
import CandleStickChart from "./components/CandleStickChart";
import { ChartData } from "./type";

function App() {
  const [fileContent, setFileContent] = useState<ChartData[] | null>(null);

  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();

      console.log("ran?");
      const SLICE_SIZE = 5 * 1024 * 1024; // 1MB
      const startPosition = Math.max(0, file.size - SLICE_SIZE);
      const blobSlice = file.slice(startPosition, file.size);

      reader.onload = (e) => {
        const result = e.target?.result;

        console.log(
          "Partial file read result:",
          result ? (result as string).substring(0, 200) + "..." : "null"
        );

        if (typeof result === "string") {
          const allLines = result.split("\n");
          // Ensure there's at least a header line
          if (allLines.length === 0) {
            console.error("CSV data is empty or unreadable.");
            setFileContent(null);
            return;
          }

          // Get header from the beginning of the file
          const reader2 = new FileReader();
          const headerSlice = file.slice(0, 1024); // Read first 1KB for header

          reader2.onload = (e2) => {
            const headerResult = e2.target?.result;
            if (typeof headerResult === "string") {
              const headerLines = headerResult.split("\n");
              const headerLine = headerLines[0];

              // Assuming comma as delimiter, trim whitespace from headers
              const headers = headerLine.split(",").map((header) =>
                header
                  .trim()
                  .toLowerCase()
                  .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
                  .replace(/\s+/g, "")
              );

              // Reverse the lines to read from bottom to top, then take first 500

              const reversedLines = allLines.reverse();
              const dataLines = reversedLines
                .slice(0, 5000)
                .filter((line) => line.trim());

              const parsedData: ChartData[] = dataLines.reduce(
                (acc: any[], line: string) => {
                  // Trim whitespace from line and skip empty lines
                  const trimmedLine = line.trim();
                  if (!trimmedLine) {
                    return acc;
                  }
                  const values = trimmedLine
                    .split(",")
                    .map((value) => value.trim());
                  if (values.length === headers.length) {
                    const obj: { [key: string]: string } = {};
                    headers.forEach((header, index) => {
                      obj[header] = values[index];
                    });
                    acc.unshift(obj);
                  } else {
                    console.warn(
                      "Skipping line due to mismatched columns:",
                      trimmedLine
                    );
                  }
                  return acc;
                },
                []
              );

              setFileContent(parsedData);
            }
          };

          reader2.readAsText(headerSlice);
        } else {
          console.error("File content could not be read as text or is empty.");
          setFileContent(null);
        }
      };

      reader.onerror = (e) => {
        console.error("File reading error:", e.target?.error);
        setFileContent(null);
        setFileName("");
      };

      reader.readAsText(blobSlice);
    } else {
      setFileContent(null);
      setFileName("");
    }
  };

  // console.log(new Date(fileContent[0].date));

  console.log("File content:", fileContent);
  return (
    <>
      <input type="file" onChange={handleFileChange} accept=".csv" />
      {fileName && <p>Selected file: {fileName}</p>}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          // width: "100%",

          // justifyContent: "center",
          // boxSizing: "border-box",
        }}
      >
        <CandleStickChart data={fileContent ?? []} />
      </div>
    </>
  );
}

export default App;
