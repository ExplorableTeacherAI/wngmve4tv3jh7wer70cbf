import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const matricesRowMeetsColumnBlocks: ReactElement[] = [
    <StackLayout key="layout-row-column-heading" maxWidth="xl">
        <Block id="row-column-heading" padding="md">
            <EditableH2 id="h2-row-column-heading" blockId="row-column-heading">
                One Row Meets One Column
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-setup" maxWidth="xl">
        <Block id="row-column-setup" padding="sm">
            <EditableParagraph id="para-row-column-setup" blockId="row-column-setup">
                Multiplying matrices is nothing like adding them. Adding pairs up matching positions,
                while multiplying pairs a whole row with a whole column, term by term, and adds the
                results into one single number. So a row and a column together produce just one entry of
                the answer, and the rest of the answer is still waiting to be built.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-row-column-rule" maxWidth="xl">
        <Block id="row-column-rule" padding="lg">
            <FormulaBlock latex="\begin{bmatrix} a & b \end{bmatrix} \begin{bmatrix} p \\ q \end{bmatrix} = a p + b q" />
        </Block>
    </StackLayout>,

    <Block key="layout-row-column-visual" id="row-column-visual">
        <VisualOptionCards
            blockId="row-column-visual"
            intro="Pick the visual that will carry this idea for your students."
            cards={[
                {
                    id: "build-entry-by-entry",
                    title: "An empty answer grid that fills one square at a time as a row is paired with a column",
                    looks:
                        "Imagine two number grids side by side with an empty grid waiting after the equals sign. Choosing a square in the empty grid lights up one row of the left grid and one column of the right, and those numbers line up underneath in pairs, ready to be multiplied.",
                    manipulate:
                        "Choose an empty square in the answer grid, then drag each pair of numbers together to build that square's total",
                    reveals:
                        "Every single number in the answer comes from one whole row meeting one whole column, never from matching positions.",
                    targetsMisconception:
                        "Students multiply matching positions together, like they do for addition",
                    paradigm: "constructivist",
                    recommended: true,
                },
                {
                    id: "two-rival-answers",
                    title: "Two finished answers to the same multiplication, only one of them correct",
                    looks:
                        "Imagine one multiplication written across the top with two completed answer grids underneath it. One was filled in by multiplying the numbers sitting in matching positions, the other by pairing rows with columns, and at a glance both look perfectly reasonable.",
                    manipulate:
                        "Tap the answer they believe is right, then drag one row and one column together to test a single square and see which answer survives",
                    reveals:
                        "Matching positions works for adding but falls apart for multiplying, and students see the exact square where it breaks.",
                    targetsMisconception:
                        "Students multiply matching positions together, like they do for addition",
                    paradigm: "prediction",
                },
                {
                    id: "sweeping-bands",
                    title: "A band sliding across a row and down a column, filling the answer as it goes",
                    looks:
                        "Imagine two grids with a soft teal band lying across one row of the left grid and a matching band running down one column of the right. As the bands are moved to a new row and column, the answer grid beside them lights up the one square those two make.",
                    manipulate:
                        "Slide the two bands to any row and any column and watch which square of the answer lights up",
                    reveals:
                        "The position of every answer square is simply the row it came from and the column it came from.",
                    paradigm: "temporal",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-row-column-reflect" maxWidth="xl">
        <Block id="row-column-reflect" padding="sm">
            <EditableParagraph id="para-row-column-reflect" blockId="row-column-reflect">
                Each entry of the answer carries its own address: the row it came from and the column it
                came from. That address is also what decides how big the answer is, which is where things
                get interesting.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
