import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

export const matricesDeterminantBlocks: ReactElement[] = [
    <StackLayout key="layout-determinant-heading" maxWidth="xl">
        <Block id="determinant-heading" padding="md">
            <EditableH2 id="h2-determinant-heading" blockId="determinant-heading">
                The Determinant
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-setup" maxWidth="xl">
        <Block id="determinant-setup" padding="sm">
            <EditableParagraph id="para-determinant-setup" blockId="determinant-setup">
                A two by two matrix has a job to do. It takes the corners of a small square and moves
                them, leaving a leaning parallelogram where the square used to be. The determinant is a
                single number that tells you how much bigger or smaller that shape became.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-determinant-formula" maxWidth="xl">
        <Block id="determinant-formula" padding="lg">
            <FormulaBlock latex="\det \begin{bmatrix} a & b \\ c & d \end{bmatrix} = ad - bc" />
        </Block>
    </StackLayout>,

    <Block key="layout-determinant-visual" id="determinant-visual">
        <VisualOptionCards
            blockId="determinant-visual"
            intro="Pick the visual that will carry this idea for your students."
            cards={[
                {
                    id: "square-into-parallelogram",
                    title: "A unit square stretched into a leaning parallelogram, with its area counted as it moves",
                    looks:
                        "Imagine a small square sitting on a grid, with a faint copy of its starting outline left behind. Two corner handles pull the shape sideways and upwards into a leaning parallelogram, and a number in the middle of the shape counts the area it now covers.",
                    manipulate:
                        "Drag either corner handle to stretch and lean the shape, and pull both onto the same line to squash it flat",
                    reveals:
                        "The determinant is simply the area the little square grows into, and it drops to zero when the shape collapses onto a line.",
                    paradigm: "conventional",
                    recommended: true,
                },
                {
                    id: "hit-the-target-area",
                    title: "A leaning parallelogram beside a marked target area to match",
                    looks:
                        "Imagine a grid holding a leaning parallelogram, with a faint rectangle next to it showing the area to aim for. Underneath the shape a running number shows how far the current area still is from that target.",
                    manipulate:
                        "Drag the two corner handles until the parallelogram covers exactly the target area, then find a different shape that matches it too",
                    reveals:
                        "Very different looking matrices can share the same determinant, because the determinant measures area and nothing else.",
                    paradigm: "goal",
                },
                {
                    id: "shape-and-formula-pair",
                    title: "A stretching square beside the four numbers and the calculation they feed",
                    looks:
                        "Imagine a square being pulled into a parallelogram on the left of the screen. On the right sit the same four numbers arranged in a matrix, with a times d minus b times c written underneath, every part of it updating as the shape moves.",
                    manipulate:
                        "Drag a corner of the shape and watch which number in the matrix and which piece of the calculation move with it",
                    reveals:
                        "Each number in the matrix records where one corner of the square went, and the calculation turns those four numbers into the area.",
                    paradigm: "constructivist",
                    secondView: {
                        shows: "The matrix with the determinant calculation written out and updating live",
                        role: "constructing",
                        syncedBy:
                            "the four matrix entries, plus a shared hover highlight linking each number to the corner it moves",
                    },
                },
            ]}
        />
    </Block>,

    <StackLayout key="layout-determinant-reflect" maxWidth="xl">
        <Block id="determinant-reflect" padding="sm">
            <EditableParagraph id="para-determinant-reflect" blockId="determinant-reflect">
                A determinant of 2 means areas double. A determinant of 0 means the parallelogram has
                flattened into a line and every scrap of area is gone, and that turns out to matter
                enormously for what comes next.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
