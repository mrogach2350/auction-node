import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dropdown, Modal } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

export default function ListDropdown() {
  const [showNewListModal, setShowNewListModal] = useState<boolean>(false);
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const result = await fetch("/api/lists");
      return await result.json();
    },
    queryKey: ["lists"],
  });

  return (
    <div>
      {isLoading ? (
        <div>Fetching lists...</div>
      ) : (
        <Dropdown
          closeOnSelect={false}
          color=""
          icon={<FontAwesomeIcon className="ml-2" icon={faAngleDown} />}
          label="Lists">
          {data?.lists?.length !== 0 ? (
            data?.lists?.map((list: any) => (
              <Dropdown.Item renderAs="a" key={list.id} value={list.id}>
                {list.name}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item value="">No Lists</Dropdown.Item>
          )}
          <Dropdown.Divider />
          <Dropdown.Item
            onClick={() => setShowNewListModal(true)}
            renderAs="a"
            value="createNew">
            Create New List
          </Dropdown.Item>
        </Dropdown>
      )}
      <Modal>
        <Modal.Card.Title>Create New List</Modal.Card.Title>
        <Modal.Card.Body></Modal.Card.Body>
        <Modal.Card.Footer></Modal.Card.Footer>
      </Modal>
    </div>
  );
}
