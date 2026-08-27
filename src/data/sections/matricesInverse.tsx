import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const matricesInverseBlocks: ReactElement[] = [
    <StackLayout key="layout-inverse-heading" maxWidth="xl">
        <Block id="inverse-heading" padding="md">
            <EditableH2 id="h2-inverse-heading" blockId="inverse-heading">
                The Inverse
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-setup" maxWidth="xl">
        <Block id="inverse-setup" padding="sm">
            <EditableParagraph id="para-inverse-setup" blockId="inverse-setup">
                Every stretch raises the same question: can you get back? The inverse of a matrix is the
                one that undoes it exactly, sending every moved point home again. Multiply a matrix by
                its inverse and you land on the identity matrix, the one that changes nothing at all.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-inverse-formula" maxWidth="xl">
        <Block id="inverse-formula" padding="lg">
            <FormulaBlock latex="\begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \frac{1}{ad - bc} \begin{bmatrix} d & -b \\ -c & a \end{bmatrix}" />
        </Block>
    </StackLayout>,

    <Block key="layout-inverse-visual" id="inverse-visual">
        <VisualOptionCards
            blockId="inverse-visual"
            intro="Pick the visual that will carry this idea for your students."
            cards={[
                {
                    id: "tune-the-way-back",
                    title: "A leaning shape and a second matrix tuned until the shape lands back on its starting square",
                    looks:
                        "Imagine a leaning parallelogram on a grid with a faint square marking exactly where it started. Below it sits a second matrix of four numbers that can each be dragged, and the leaning shape shifts and turns the moment any of them changes.",
                    manipulate:
                        "Drag the four numbers of the second matrix until the leaning shape settles back onto the faint square",
                    reveals:
                        "Only one matrix undoes another, and putting the two together leaves every point exactly where it began.",
                    paradigm: "inversion",
                    recommended: true,
                },
                {
                    id: "there-and-back-timeline",
                    title: "A letter F tipped over by a matrix and walked back upright by its inverse",
                    looks:
                        "Imagine a capital F drawn on a grid. It leans and stretches as one matrix is applied, then travels back to standing upright as the inverse is applied, and a short timeline underneath marks those two moves.",
                    manipulate:
                        "Drag along the timeline to run the stretch and the undo forwards and backwards at their own pace",
                    reveals:
                        "A matrix followed by its inverse leaves you precisely where you started, which is what the identity matrix means.",
                    paradigm: "temporal",
                },
                {
                    id: "no-way-back-from-flat",
                    title: "A square squashed flat onto a line, with four numbers that never bring it back",
                    looks:
                        "Imagine a square that has been crushed onto a single line across the grid, with four draggable numbers offered underneath as a possible way back. However those numbers are set, the flattened line slides and turns but never opens out into a square again.",
                    manipulate:
                        "Try any combination of the four numbers to reopen the flattened line into a square",
                    reveals:
                        "When the determinant is zero the shape has lost its width for good, so there is no inverse to be found.",
                    paradigm: "goal",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-inverse-reflect" maxWidth="xl">
        <Block id="inverse-reflect" padding="sm">
            <EditableParagraph id="para-inverse-reflect" blockId="inverse-reflect">
                Notice that the formula divides by the determinant, which explains the strange case from
                before. A flattened shape has thrown away the information about where its points came
                from, so a matrix with determinant zero has no inverse at all.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
