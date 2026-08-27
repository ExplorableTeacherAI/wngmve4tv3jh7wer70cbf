import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const matricesSizeAndOrderBlocks: ReactElement[] = [
    <StackLayout key="layout-size-order-heading" maxWidth="xl">
        <Block id="size-order-heading" padding="md">
            <EditableH2 id="h2-size-order-heading" blockId="size-order-heading">
                Size and Order
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-size-order-setup" maxWidth="xl">
        <Block id="size-order-setup" padding="sm">
            <EditableParagraph id="para-size-order-setup" blockId="size-order-setup">
                Not every pair of matrices can be multiplied at all. The row you take and the column it
                meets must hold the same number of entries, or the pairing runs out halfway through. That
                one requirement settles two questions at once: whether the multiplication is possible,
                and what size the answer comes out.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <Block key="layout-size-order-visual" id="size-order-visual">
        <VisualOptionCards
            blockId="size-order-visual"
            intro="Pick the visual that will carry this idea for your students."
            cards={[
                {
                    id: "blocks-that-snap",
                    title: "Two matrix blocks that only lock together when the touching edges match",
                    looks:
                        "Imagine two rectangular blocks on a workbench, each one as tall as its number of rows and as wide as its number of columns, with a faint outline of the answer waiting beside them. Pushing the blocks together, the touching edges either lock cleanly or refuse, and the waiting outline resizes itself to fit.",
                    manipulate:
                        "Drag the edges of each block to change its size, then push the two together to see whether they lock",
                    reveals:
                        "Only the two touching edges have to match, and it is the outer edges that decide the size of the answer.",
                    targetsMisconception:
                        "Students try to multiply matrices whose sizes do not fit",
                    paradigm: "goal",
                    recommended: true,
                },
                {
                    id: "both-ways-round",
                    title: "The same two matrices multiplied both ways round, one answer above the other",
                    looks:
                        "Imagine a pair of matrices at the top of the screen with two answers underneath, one worked out as A times B and the other as B times A. Changing any number in the pair updates both answers at the same instant, and any squares where the two disagree are circled.",
                    manipulate:
                        "Drag any number inside the two matrices and compare how the two answers underneath respond",
                    reveals:
                        "Swapping the order almost always changes the answer, so with matrices the order you write them in is part of the question.",
                    targetsMisconception:
                        "Students assume A times B gives the same answer as B times A",
                    paradigm: "comparison",
                },
                {
                    id: "call-the-size-first",
                    title: "A blank answer rectangle students shape before the real answer is revealed",
                    looks:
                        "Imagine two matrices with their sizes written underneath and, after the equals sign, a plain grey rectangle where the answer will appear. Two small handles on that rectangle add or remove rows and columns, and it reshapes as they are pulled.",
                    manipulate:
                        "Pull the handles until the blank rectangle is the size they think the answer will be, then uncover the real answer to check",
                    reveals:
                        "The answer takes its number of rows from the first matrix and its number of columns from the second.",
                    targetsMisconception:
                        "Students guess the wrong size for the answer matrix",
                    paradigm: "prediction",
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-size-order-reflect" maxWidth="xl">
        <Block id="size-order-reflect" padding="sm">
            <EditableParagraph id="para-size-order-reflect" blockId="size-order-reflect">
                There is a second surprise hiding here. With ordinary numbers 3 times 7 and 7 times 3
                agree, but with matrices, swapping the order usually changes the answer, and sometimes it
                makes the multiplication impossible altogether.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
