import { useQuery } from "@tanstack/react-query";
import Dropdown from "./Dropdown";

export default function ListDropdown() {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const result = await fetch("/api/lists");
      return await result.json();
    },
    queryKey: ["lists"],
  });

  const listItems = data?.lists?.map((l: any) => ({ id: l.id, text: l.name }));
  return (
    <div>
      {isLoading ? (
        <div>Fetching lists...</div>
      ) : (
        <Dropdown
          listItems={[
            ...listItems,
            { id: "createNewList", text: "Create New List" },
          ]}
        />
      )}
    </div>
  );
}
