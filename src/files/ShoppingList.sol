// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ShoppingList {
    // Maximum items
    uint256 private constant MAX_ITEMS = 100;

    // Fixed-size arrays for item data
    bytes32[MAX_ITEMS] private names; // Item names
    bool[MAX_ITEMS] private purchased; // Purchased status
    bool[MAX_ITEMS] private exists; // Existence flag
    uint256 private itemCount;

    event ItemAdded(address indexed user, uint256 indexed itemId, bytes32 name);
    event ItemToggled(address indexed user, uint256 indexed itemId, bool purchased);
    event ItemDeleted(address indexed user, uint256 indexed itemId);

    // Modifier to enforce item limit
    modifier withinItemLimit() {
        // Gas bound: max 100 items
        require(itemCount < MAX_ITEMS, "Item limit reached");
        _;
    }

    // Add an item to the shopping list
    // Gas bound: writes to fixed-size arrays with max 100 slots
    function addItem(bytes32 _name) external withinItemLimit {
        uint256 itemId = itemCount; // Cache itemCount
        require(itemId < MAX_ITEMS, "Item ID out of bounds"); // Explicit bounds check
        names[itemId] = _name;
        purchased[itemId] = false;
        exists[itemId] = true;
        itemCount++;
        emit ItemAdded(msg.sender, itemId, _name);
    }

    // Toggle the purchased status of an item
    // Gas bound: single write to fixed-size array
    function togglePurchased(uint256 _itemId) external {
        require(_itemId < itemCount, "Invalid item ID");
        require(_itemId < MAX_ITEMS, "Item ID out of bounds"); // Explicit bounds check
        require(exists[_itemId], "Item does not exist");
        purchased[_itemId] = !purchased[_itemId];
        emit ItemToggled(msg.sender, _itemId, purchased[_itemId]);
    }

    // Delete an item from the shopping list
    // Gas bound: single write to fixed-size array
    function deleteItem(uint256 _itemId) external {
        require(_itemId < itemCount, "Invalid item ID");
        require(_itemId < MAX_ITEMS, "Item ID out of bounds"); // Explicit bounds check
        require(exists[_itemId], "Item does not exist");
        exists[_itemId] = false;
        emit ItemDeleted(msg.sender, _itemId);
    }

    // Get a single item by ID
    // Gas bound: reads from fixed-size arrays with max 100 slots
    function getItem(uint256 _itemId) external view returns (bytes32 name, bool purchasedStatus, bool existsStatus) {
        require(_itemId < itemCount, "Invalid item ID");
        require(_itemId < MAX_ITEMS, "Item ID out of bounds"); // Explicit bounds check
        return (names[_itemId], purchased[_itemId], exists[_itemId]);
    }

    // Get the total number of items
    function getItemCount() external view returns (uint256) {
        return itemCount;
    }
}
