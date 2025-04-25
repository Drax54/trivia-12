#!/bin/bash

# Script to check for and fix duplicate quizzes

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Ensure Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python is not installed or not in PATH.${NC}"
    exit 1
fi

# Determine Python command
PYTHON="python"
if ! command -v python &> /dev/null; then
    PYTHON="python3"
fi

# Print header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}       Duplicate Quiz Detection & Fixing       ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# Function to display the menu
show_menu() {
    echo -e "${GREEN}What would you like to do?${NC}"
    echo -e "${YELLOW}1)${NC} Analyze duplicates (no changes)"
    echo -e "${YELLOW}2)${NC} Find exact duplicates (same ID and name)"
    echo -e "${YELLOW}3)${NC} Remove exact duplicate quizzes"
    echo -e "${YELLOW}4)${NC} Fix duplicate IDs (generate new IDs)"
    echo -e "${YELLOW}5)${NC} Dry run: show what would be changed"
    echo -e "${YELLOW}0)${NC} Exit"
    echo
    echo -ne "${GREEN}Enter your choice [0-5]:${NC} "
    read -r choice
}

# Process the user's choice
process_choice() {
    case $choice in
        1)
            echo -e "\n${BLUE}Analyzing duplicates in quizzes.json...${NC}\n"
            $PYTHON fix_duplicate_quizzes.py --mode analyze
            ;;
        2)
            echo -e "\n${BLUE}Finding exact duplicates...${NC}\n"
            $PYTHON find_exact_duplicates.py
            ;;
        3)
            echo -e "\n${BLUE}Removing exact duplicate quizzes...${NC}\n"
            $PYTHON fix_duplicate_quizzes.py --mode exact
            ;;
        4)
            echo -e "\n${BLUE}Fixing duplicate IDs...${NC}\n"
            $PYTHON fix_duplicate_quizzes.py --mode id
            ;;
        5)
            echo -e "\n${BLUE}Dry run mode:${NC}\n"
            echo -e "${YELLOW}Select what to fix in dry run mode:${NC}"
            echo -e "1) Remove exact duplicates"
            echo -e "2) Fix duplicate IDs"
            echo -ne "${GREEN}Enter your choice [1-2]:${NC} "
            read -r dryrun_choice
            
            if [ "$dryrun_choice" = "1" ]; then
                echo -e "\n${BLUE}Dry run: Remove exact duplicates${NC}\n"
                $PYTHON fix_duplicate_quizzes.py --mode exact --dry-run
            elif [ "$dryrun_choice" = "2" ]; then
                echo -e "\n${BLUE}Dry run: Fix duplicate IDs${NC}\n"
                $PYTHON fix_duplicate_quizzes.py --mode id --dry-run
            else
                echo -e "${RED}Invalid choice.${NC}"
            fi
            ;;
        0)
            echo -e "\n${GREEN}Exiting.${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid choice. Please try again.${NC}\n"
            ;;
    esac
}

# Main loop
while true; do
    show_menu
    process_choice
    echo
    echo -e "${BLUE}===============================================${NC}"
    echo -ne "${GREEN}Press Enter to continue...${NC}"
    read -r
    clear
done 