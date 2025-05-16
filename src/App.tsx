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
      const SLICE_SIZE = 1024 * 1024; // 1MB
      const blobSlice = file.slice(0, SLICE_SIZE);

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

          const headerLine = allLines[0];
          // Assuming comma as delimiter, trim whitespace from headers
          const headers = headerLine.split(",").map((header) =>
            header
              .trim()
              .toLowerCase()
              .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
              .replace(/\s+/g, "")
          );

          // Take up to the first 1000 data lines (excluding header)
          const dataLines = allLines.slice(1, 501);

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
                acc.push(obj);
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        justifyContent: "center",
      }}
    >
      <input type="file" onChange={handleFileChange} accept=".csv" />
      {fileName && <p>Selected file: {fileName}</p>}

      <div>
        <CandleStickChart data={fileContent ?? []} />
      </div>
    </div>
  );
}

export default App;
