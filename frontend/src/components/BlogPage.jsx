import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Card, CardContent, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PromptPlaceholder = ({ prompt, caption }) => (
  <Box sx={{ my: 2, p: 2, border: '1px dashed grey', borderRadius: '4px' }}>
    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.700' }}>
      **Prompt for Screenshot:**
    </Typography>
    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: '4px' }}>
      {prompt}
    </Typography>
    <Box sx={{ mt: 1, p: 2, textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
      <Typography variant="caption" sx={{ color: 'grey.600' }}>
        [Screenshot of the AI's response to the prompt above]
        <br />
        {caption}
      </Typography>
    </Box>
  </Box>
);

const BlogPage = () => {
  const final_review = `Throughout the project, I used Gemini CLI extensively for testing algorithms, creating visualizations, debugging, designing an application, and restructuring my project repository. This experience gave me a good sense of the strengths, weaknesses, and situations where Gemini is useful versus not so much... My overall experience is that Gemini CLI is a powerful tool under the right circumstances. It is excellent for small coding tasks, file creation, quick testing and debugging, conceptual explanations, simple visualizations, and Git assistance. However, it struggles with large files, complex updates, and maintaining context over long sessions. Despite the frustrations, this project did give me a meaningful insight into how AI-assisted software development works and how to collaborate meaningfully with AI.`;

  const weeklyLogs = {
    week1: {
      title: "Week 1: Project Setup and First Steps with Gemini",
      content: `This week, the project goals were:
-- Design system architecture: define the structure for algorithm implementations, visualization frontend, and necessary backend components
-- Structure Github repository with named folders for algorithms, notebooks, visualizations, and documentation and README with project goals and instructions to follow along
-- Install and learn Gemini CLI: explore its capabilities for visualization, UI generation, etc	

The following was accomplished:
The system architecture is outlined in the README file, and the corresponding folders were added to the repository. Gemini CLI was easy to install and setup with my personal google account, but not possible with umich accounts. It works great for git commands and tells you how to run scripts it writes. When you ask it to complete something it will suggest a solution and then ask if it can be implemented or if you would like to modify it, which is helpful. Sometimes it accidentally tries to edit the wrong file or uses the wrong file path, so you still have to be careful and read what it is attempting to do. I messed it up once because I had "&" in a file name and it struggled to move the file because of the special character. Overall, I asked it several basic prompts to test its capabilities and it excelled very well at these. Pictures of the Gemini output can be found in the ai_interactions folder. 

These are the prompts I asked it:
Write a Python function that computes the factorial of a number using recursion.

def add_numbers(a, b):
    return a - b
Find the bug and correct the function so it returns the sum.
Write docstring for this function explaining its inputs and outputs.

Create a Python script that plots y = x^2 for x from -10 to 10 using matplotlib.
Modify the plot to allow user input for the function to plot.

Write pseudocode for the bisection method for finding roots of a function.
Explain how gradient descent works in simple terms.`
    },
    week2: {
      title: "Week 2: Implementing and Visualizing 1D Algorithms",
      content: `This week the project goals focused around algorithm implementations, specifically to implement the one-dimensional algorithms: Bisection, Secant, Newton-Raphson, Golden Search in Python, to test them in Jupyter notebooks and compare to existing Python packages (like SciPy), and to use GenAI to implement basic visualization plots with Plotly for each algorithm’s output.

I began with implementing the one-dimensional algorithms, and then prompted Gemini to create a Jupyter Notebook to test the algorithms with SciPy and NumPy. I did run into some problems with Gemini creating the testing notebook as it failed to properly format the file as a JSON. I fed it the error message that Jupyter told me and continued to fail to produce a working notebook 3 more times. At one point, it decided to write a python script to create the Jupyter notebook and this still failed. Finally, it decided to create the python script line by line, which was incredibly slow and BLANK. This whole error process took about 20 minutes, before Gemini completely broke and glitched out. I decided to create the notebook myself and see if Gemini could still write the code to check the algorithms. Which it did, but it wanted me to add the code manually to the Jupyter notebook in fear of messing it up again. Images of the error process and work through can be found in screenshots/week2. 

The notebook can be found in the testing_notebooks folder, and the results showed that my implementations were correct against SciPy and NumPy using well-known example functions and results taken from the literature in the project proposal. However, I spent quite some time debugging the test and ran across an interesting fact about SciPy's Golden Search which is that it does not strictly enforce the bracket boundaries. I also decided to format my screenshots by weeks for organization.

I attempted to create basic animated visualizations of the one-dimensional algorithms from this week with Gemini CLI. At first, we had a few discussions about why it is important to visualize the algorithms in matplotlib before the final interactive web application, so we can understand what exactly should be visualized or interactive. For example, with the bisection and secant method, Gemini suggested redefining my algorithm to yield the values of a, b, and mid (or x0, x1, x2) each iteration. 

Additionally, for bisection, I asked Gemini what it thinks should happen if one of the roots is given as one of the input values, to which it suggested adding an edge case check for this at the beginning, instead of erroring out. This update was added to the Secant visualization file too. In the Newton-Raphson, the animation that Gemini produced was good, but it showed the tangent line only going in one direction, which felt less intuitive that it is a tangent line not just an arrow to 0. Therefore, I prompted Gemini to fix this, and it did. Also for golden search, I ran into some problems with the requirement of the input function to be unimodal, which is too difficult and costly to check in the algorithm, therefore if I allow users to input functions in the app, it must be clear that they can only input unimodal functions or else it will fail. The golden search visualization I spent quite some time with, as one of the functions kept failing despite passing in the testing notebook, and I was trying to work with Gemini to craft a way to show the 38.2% reduction in bracketing that defines Golden Search. I ended up not liking any of Gemini’s suggestions, and prompted it to shade the 38.2% versus the rest to showcase it, which turned out much more intuitive and clear. The final visualizations can be found in the visualizations folder, inside the one-dimensional folder.`
    },
    week3: {
      title: "Week 3: Pivoting to a React/JavaScript Frontend",
      content: `I had some change of plans this week as I had to reorganize my plan for hosting and developing the application. I decided to host it on render using a flask with javascript backend and react frontend. This meant I added a backend folder and converted my algorithm files from python to javascript with Gemini. I also had Gemini create a Node.js file to test the algorithmic implementations for the multi-dimensional algorithms against SciPy, which can be found in the screenshots folder under week 3. 

After these algorithm steps, I moved onto setting up React and Flask. Gemini was very helpful at explaining how to install and get everything set up, but I found that running installation commands was more simple in a separate terminal where I could see what was going on, as Gemini doesn’t send feedback until its done running so I wasn’t sure what was happening. Gemini made a little typo at some point deleting files but it caught it by itself. With the help of Gemini, I was able to get the application working with a basic Plotly graph and the 6 algorithms with a single function root test for each.

Some other things I learned this week is that Gemini has no memory of past conversations, as each session is independent and knowledge based on the current conversation only. However, there is a save-memory tool that allow Gemini to remember specific facts, I used it to have Gemini no longer add prefixes to commit messages.

Additionally, Gemini is pretty nice in that it can surf the web if you have current relevant questions. I asked it for the news from the previous day and it easily pulled up information. Found in screenshot Gemini_week3_websurfing. However, if you leave a session for a long time like I did, it can only surf the web from the day before the session started so the longer the session is open the more out of date its information can be.

Later in the week, I spent some more time with Gemini developing the interactivity of the application. I did run into a problem when I asked Gemini to update a file with code it suggested, it seems the code to update the file was too large fro Gemini to process in a single command so it defaulted to creating a python script to write to the original file. This method proved to be more stable for creating the JavaScript files, but it is another few steps that Gemini has to take, and they must be approved of. I think this supports my general feelings that Gemini is very helpful but more so for small changes, bugs, maybe Git commands, and not so much writing lots of code. Once I got bisection working as I wanted, I implemented Golden Search which was much easier now that Gemini knew what worked and didn’t. I will also credit Gemini for remembering how I wanted to visualize the golden ratio in the graph from the Jupyter notebook we worked on, but this was because I never terminated the session. However, I ran into the same problem a lot this week where Gemini wanted to update an algorithmic visualization we already had worked on, despite numerous explanations that it was already done.`
    },
    week4: {
      title: "Week 4: Building the Backend and Data Input Features",
      content: `I spent lots of time with the user interface for the one-dimensional algorithms last week, and had planned to move onto multi-dimensional algorithms but first ended up spending more time with the one-dimensional to get the backend working.

I decided to implement the backend for both one dimensional and multidimensional algorithms because I felt it would make the application more applicable and interesting. I started with the one-dimensional, and worked with Gemini to develop a plan to get the backend server running and one that that would be compatible with Vercel as I was using that to host my app prior.

While I ran into many problems with the server, Gemini was helpful in trying different diagnostic tests to figure out what was causing the problem. I will say that Gemini ran out of the daily limit of the advanced model and was forced to sue the fallback mode, which definitely is not as talented or intelligent as the more advanced model. I was still trying to get the backend serve to connect to my frontend when Gemini switched and I could tell how much slower the default model is and how susceptible it is to getting stuck. 

Gemini is definitely still very helpful, but as my files get longer and the project more complicated, it struggles. This reinforces my feelings that Gemini is great for  small coding tasks or designing/structuring projects, but it has its limitations.

At the end of the week, Gemini and I had the backend connected to the frontend. Additionally we adopted the one-dimensional pages to allow users to switch between function vs data. The function mode works as previously, but the data mode allows them to input a csv, to which the program runs cubic spline interpolation on, and then finds the root according to whichever algorithm. I am glad to have the one-dimensional algorithms fully done, and I look forward to working on the multi-dimensional algorithms visualizations next week!`
    },
    week5: {
      title: "Week 5: Visualizing Multi-dimensional Algorithms and Trust Issues",
      content: `This week I chose to pivot back to the algorithms to work on visualizing the two multidimensional algorithms.
	I replicated much of the structure of the one-dimensional algorithms page, with function input, initial guess, and algorithmic specific details, as well as the number of dimensions.In the gradient descent algorithm in multiple dimensions, I chose to visualize this by showing the path the algorithm takes across the function’s surface. Since the function now has more than one input variable, I use a contour plot (or 3D surface plot) to represent the function’s landscape. The algorithm’s iterations are overlaid as points or arrows to show how it moves toward the minimum. This allows users to see not only the convergence behavior but also the trajectory through the “valleys” and “ridges” of the function. I also included a pseudocode display so that users can connect the visual path with the underlying computational steps, making the algorithm’s behavior clear in higher dimensions.
	For functions or data greater than three dimensions, I chose to show convergence plots and tables of iteration coordinates, so users can track the algorithm’s progress even when it’s not possible to visualize all dimensions at once.I ran into some interesting errors with Gemini, specifically a use of NOOP, no-operation command that forced me to allow it to be run despite telling Gemini to stop using that. NOOP was just a no operation command that allowed Gemini to print something to me, but generally in the past few weeks Gemini could just speak to me without needing permission for a NOOP command. This was completely new to me, and I attempted to stop it by using the save-memory command to tell Gemini not to use it, but Gemini would not save this fact to memory, despite me feeding the save-memory command and details several times. 
	I will say that when I transitioned my project from backend to frontend only this week, Gemini was very helpful. I asked it how long it expected this process to take and it estimated 2-3 days of work, but it only took Gemini about 30 minutes to convert the necessary files, restructure the project, and update other dependent files. This impressed me, and felt like a great use of Gemini to accomplish a complicated task in a short amount of time. Also, I think one of the benefits of collaborating with Gemini is that I have learned more about how to debug an application by using console logs. I would have never known how to work through many of the problems I have encountered with Gemini, but to learn how Gemini handles them has been incredibly beneficial.
	At some point we were working through a bug in the frontend and when I went to check the files in VSCode, and they were empty. I accused Gemini of corrupting the files, but it denied touching those files.  This came up multiple times this week with several different files. I am not sure if it is related to the fallback/default version of Gemini used when I hit my limit of the pro for the day but it is quite frustrating, and a major con of using Gemini.  Moreover,  I did some personal research into this problem to see if it really was Gemini that seemed to empty my files without ever asking me or claiming to have touched those files. I found some interesting articles about people losing all of their files thanks to Gemini CLI, which is truly awful for them, but nice to know I wasn’t alone in this problem. This has led me to believe that it is best to use Gemini CLI in a smaller directory you want to work on, instead of an entire project or your whole Desktop. In general, I have lost trust in Gemini.
The article and forum I found:https://news.ycombinator.com/item?id=44651485
https://dev.ua/en/news/ya-povnistiu-i-katastrofichno-pidviv-vas-1753427615`
    },
    week6: {
      title: "Week 6: Final Refinements and Project Wrap-up",
      content: `This week my focus was on refining the details of the application. I made sure the one-dimensional algorithms reflected whether they found roots or minimums, added notes to the user about usage, and updated the initial function to be the same for all one-dimensional algorithms and the same for the multi-dimensional algorithms. I also checked pseudocode, descriptions, and the specific details for each algorithm to make sure they were accurate. I used Gemini CLI to publish my blog on the application that included the Gen-AI tutorial. I included my raw logs, but also I summarized my experiences, lessons learned, insights, and overall review of Gemini CLI in a separate tab in the blog section. I also tested functionality of the application, making sure data input works, different functions, different parameters, etc. I also fixed my README and clean up unused files.`
    }
  };

  return (
    <div style={{ backgroundColor: '#F4F2EF', fontFamily: 'Roboto, Arial, sans-serif', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#FFF5E6', height: '77px', boxShadow: 'none', borderBottom: '1px solid #ccc' }}>
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img src="/character.png" alt="Owl Character" style={{ maxWidth: '50px', height: 'auto', marginRight: '10px' }} />
            <Typography variant="h4" sx={{ color: '#72A8C8', fontFamily: 'Roboto', fontWeight: '700' }}>OptiLearn</Typography>
          </Link>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: '900px', margin: 'auto', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ flex: 1, mr: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
              A Developer's Guide to Building with a Gen-AI Assistant
            </Typography>
            <Typography variant="h6" sx={{ color: 'grey.700' }}>
              An honest look at the process of building OptiLearn with the help of Google's Gemini.
            </Typography>
          </Box>
          <Box sx={{ maxWidth: '350px', backgroundColor: 'white', p: '10px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <img src="/blog_images/gemini_opening.png" alt="Gemini CLI opening screen" style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
          </Box>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Introduction</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{final_review}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Chapter 1: The Art of the Prompt</Typography>
            <Typography variant="body1" paragraph>
              Working with an AI assistant is a dialogue. You start with a simple request, and then you refine. In my first week, I tested Gemini's capabilities with small, well-defined tasks. It excelled at these, which helped build a foundation of trust and understanding.
            </Typography>
            <Typography variant="h6" component="h3" gutterBottom>Key Prompt: A Simple Fix</Typography>
            <Typography variant="body1" paragraph>
              Here is an example of a perfect first prompt. It's small, specific, and has a clear definition of success.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_CLI_bug_fix.png" alt="Simple bug fix prompt and response" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                My first interaction: asking the AI to find and fix a simple bug.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Chapter 2: Gemini's Strengths: Small Tasks and Big Ideas</Typography>
            <Typography variant="body1" paragraph>
              Throughout this project, Gemini proved to be an invaluable partner for a wide range of tasks. Its strengths were most apparent in two key areas: executing small, well-defined coding tasks and providing high-level suggestions for design and architecture.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom>Strength: Testing and Verification</Typography>
            <Typography variant="body1" paragraph>
              Once I had implemented a new algorithm, Gemini was excellent at helping me test it. It could quickly generate testing scripts, suggest testing frameworks, and even run the tests for me. This was a huge time-saver and helped me verify my implementations quickly.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_week3_testingalgos.png" alt="AI helping with algorithm testing" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                Gemini creating and running a script to test my algorithm implementations.
              </Typography>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom>Strength: Design and Visualization Ideas</Typography>
            <Typography variant="body1" paragraph>
              Beyond writing code, Gemini was a great creative partner. When I was unsure how to visualize a complex algorithm, I could ask for suggestions. It would propose different types of plots, suggest libraries like Plotly, and help with the overall design of the user interface.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_CLI_newtonRaphson.png" alt="AI providing design suggestions for Newton Raphson" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                Gemini helping to visualize Newton's Method.
              </Typography>
            </Box>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_week3_suggestions.png" alt="AI providing design suggestions" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                Gemini offering suggestions for visualization and implementation.
              </Typography>
            </Box>
            
            <Typography variant="h6" component="h3" gutterBottom>Learning to Debug</Typography>
            <Typography variant="body1" paragraph>
              One of the most valuable skills I learned while working with Gemini was how to debug frontend code. When things didn't work as expected, the AI would guide me through the process of using `console.log` to trace data and identify issues. This was a new and incredibly useful skill for me.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_CLI_console_log.png" alt="Learning to debug with console.log" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                Gemini teaching me how to use `console.log` to debug the frontend.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Chapter 3: Handling Real-World Data & Architectural Pivots</Typography>
            <Typography variant="body1" paragraph>
              As the project grew, I wanted to move beyond hardcoded functions and allow users to upload their own data. This led to one of the most significant architectural shifts in the project.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom>From Backend to Frontend</Typography>
            <Typography variant="body1" paragraph>
              Initially, the plan was to have a Python Flask backend to handle data processing. Gemini was incredibly helpful in setting up this initial backend structure. The image below shows one of our early sessions where we were getting the Flask server running.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_CLI_backend_setup.png" alt="Setting up the Flask backend" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                An early session setting up the Python backend with Flask.
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              However, we later decided to pivot to a frontend-only application to simplify deployment. This meant all the data processing, including CSV parsing and interpolation, had to happen in the browser. Gemini was instrumental in this transition, helping to move the algorithm files from the backend to the frontend, remove the unnecessary Flask features, convert logic from Python to JavaScript, and restructure the project for a client-side only architecture.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom>Key Prompt: A Complex Feature Request</Typography>
            <Typography variant="body1" paragraph>
              This prompt kicked off the implementation of the client-side data processing feature, which became a cornerstone of the final application.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_CLI_dataPage.png" alt="Complex feature request prompt and response" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                Prompting the AI to implement the CSV data input and interpolation feature.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>Chapter 4: When Things Go Wrong</Typography>
            <Typography variant="body1" paragraph>
              Collaboration with the AI was not always smooth. It's important to be aware of its limitations. I encountered several challenges, including struggles with large files, mistakes in file paths, and issues with cross-session memory.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom>Limitation: Memory & Model Switching</Typography>
            <Typography variant="body1" paragraph>
              Gemini has poor cross-session memory. To mitigate this, you can use the `save-memory` tool, although I found this didn't always work as expected. This limitation becomes more apparent when the daily limit of the advanced model is reached, and the less capable fallback model is used.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/gemini_week4_noop_fixAttempt.png" alt="Attempting to use save-memory" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                An attempt to use the `save-memory` tool to prevent the AI from using the `NOOP` command.
              </Typography>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom>Limitation: Handling Large Files</Typography>
            <Typography variant="body1" paragraph>
              As the project grew, the AI began to struggle with editing large files directly. In this instance, instead of modifying the file, it chose to create a separate Python script to apply the update. This is a clever workaround, but it adds extra steps to the process.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_week3_problemwithfile.png" alt="AI creating a python script to edit a file" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                The AI creating a Python script to edit a file it was struggling with.
              </Typography>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom>Limitation: Mistakes in File Paths</Typography>
            <Typography variant="body1" paragraph>
              Gemini sometimes makes mistakes with file paths, especially when dealing with special characters or complex directory structures. This can lead to errors or unexpected behavior.
            </Typography>
            <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
              <img src="/blog_images/Gemini_week3_typo.png" alt="AI making a typo in a file path" style={{ width: '100%', borderRadius: '4px' }} />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'grey.600' }}>
                An example of Gemini making a typo in a file path, leading to an error.
              </Typography>
            </Box>

            <Typography variant="h6" component="h3" gutterBottom>Warning: File Corruption</Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              The most serious issue I encountered was file corruption. On several occasions, files were emptied without any warning or log of the action. This highlights the absolute necessity of using version control (like Git) and being cautious about running an AI assistant on important, irreplaceable files.
            </Typography>
          </CardContent>
        </Card>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Appendix: Full Project Logs</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(weeklyLogs).map(([week, logData]) => (
              <Accordion key={week}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{logData.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{logData.content}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>
    </div>
  );
};

export default BlogPage;